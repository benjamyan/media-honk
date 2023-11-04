DROP PROCEDURE IF EXISTS media_bundle_entry_set_relationships;

/**
@procedure media_bundle_row_entry_with_relationships - This procedure is so we can build an entire relationship for a new media bundle
1. Error check baseline errors for required params
2. Find and store the source ID key - if not found, return with error
3. Persist the new bundle (if necessary), then store that bundles ID
4. If given cats and artists, run that FN and store the returns keys into a temp table
5. Loop through the given `mediaEntries`, persist in `media` and set relations in `media_relationships` 

@param sourceUrl - The given source URL so we can match the media and bundle to a source
@param relativeUrl - 
@param mainTitle - For bundles only
@param subTitle - 
@param coverImageUri
@param totalEntries
@param mediaArtists
@param mediaCategories

@returns 
*/

DELIMITER //
CREATE PROCEDURE media_bundle_entry_set_relationships 
(
    IN sourceUrl TEXT,
    IN relativeUrl TEXT,
    IN mainTitle TEXT,
    IN subTitle TEXT,
    IN coverImageUri TEXT,
    IN mediaEntries JSON,
    IN mediaArtists TEXT,
    IN mediaCategories TEXT
)
BEGIN

    /* DECLARE ProcedureSchema TEXT DEFAULT '{
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "Schema for procedure parameters",
        "type": "object",
        "properties": {
            "sourceUrl": {
                "type": "string"
            },
            "relativeUrl": {
                "type": "string"
            },
            "mainTitle": {
                "type": "string"
            },
            "subTitle": {
                "type": "string"
            },
            "coverImageUri": {
                "type": "string"
            },
            "mediaEntries": {
                "type": "array"
            },
            "mediaArtists": {
                "type": "array"
            },
            "mediaCategories": {
                "type": "array"
            }
        },
        "required": ["sourceUrl", "relativeUrl", "mainTitle", "mediaEntries"]
    }'; */
    DECLARE EntriesSchema TEXT DEFAULT '{
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "Bundle media entry array",
        "type": "array", 
        "items": {
            "type": "object",
            "properties": {
                "index":{
                    "type": "number",
                    "minimum": 0
                },
                "filename": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                }
            },
            "required": ["index", "filename", "title"]
        }
    }';
    DECLARE SourceId INT unsigned DEFAULT NULL;
    DECLARE BundleId INT unsigned DEFAULT NULL;
    DECLARE MediaMetaIdList TEXT DEFAULT NULL;
    DECLARE MediaEntryList TEXT DEFAULT NULL;
    DECLARE Jndex INT unsigned DEFAULT 0;
    DECLARE ErrMsg TEXT DEFAULT 'Unknown exception in `media_bundle_entry_set_relationships`';
    DECLARE RetryDeclare VARCHAR(10) DEFAULT 'SourceId';

    DECLARE EXIT HANDLER FOR SQLSTATE 'ERROR'
        BEGIN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = ErrMsg ;
        END;
    DECLARE CONTINUE HANDLER FOR SQLSTATE 'RETRY'
        BEGIN
            CASE
                WHEN RetryDeclare = 'SourceId' THEN
                    SET SourceId = (
                        SELECT id FROM sources WHERE abs_url = sourceUrl
                    );
                WHEN RetryDeclare = 'BundleId' THEN
                    SET BundleId = (
                        SELECT id FROM bundles WHERE main_title = mainTitle AND sub_title <=> subTitle
                    );
                ELSE
                    SET ErrMsg = 'Bad retry declaration.';
                    SIGNAL SQLSTATE 'ERROR';
            END CASE;
        END;
        
    -- Error checks and validation
    IF ISNULL(sourceUrl) THEN
        SET ErrMsg = '`sourceUrl` cannot be NULL';
        SIGNAL SQLSTATE 'ERROR';
    ELSEIF ISNULL(mainTitle) THEN
        SET ErrMsg = '`mainTitle` cannot be NULL';
        SIGNAL SQLSTATE 'ERROR';
    ELSEIF JSON_TYPE(mediaEntries) != 'ARRAY' THEN
        SET ErrMsg = '`mediaEntries` must be a non-empty array with valid schema';
        SIGNAL SQLSTATE 'ERROR';
    ELSEIF LENGTH(mediaEntries) = 0 THEN
        SET ErrMsg = '`mediaEntries` cannot be empty';
        SIGNAL SQLSTATE 'ERROR';
    ELSEIF JSON_SCHEMA_VALID(EntriesSchema, mediaEntries) = 0 THEN
        SET ErrMsg = '`mediaEntries` items failed schema validation';
        SIGNAL SQLSTATE 'ERROR';
    END IF;
    
    /*
    #1 find our source and store its ID
    */
    SIGNAL SQLSTATE 'RETRY';
    IF ISNULL(SourceId) THEN
        -- If we have a valid sourceUrl parameter, but failed to locate it on table, retrun error and exit
        SET ErrMsg = CONCAT('Failed to locate sources with `abs_url` of ', sourceUrl, ' (sourceUrl parameter)');
        SIGNAL SQLSTATE 'ERROR';
    END IF;

    /*
    #2 (find or persist) the bundle and store its ID
    */
    SET RetryDeclare = 'BundleId';
    SIGNAL SQLSTATE 'RETRY';
    IF ISNULL(BundleId) THEN
        -- Bundle doesnt exist make a new entry
        INSERT INTO 
            bundles(main_title, sub_title)
        VALUES (
            mainTitle, subTitle
        );
        -- Select for the newly entered bundle
        SIGNAL SQLSTATE 'RETRY';
        -- If it still doesnt exist, something went wrong
        IF ISNULL(BundleId) THEN
            SET ErrMsg = CONCAT('Unhandled exception when attempting SELECT or INSERT on `bundles` from `media_bundle_entry_set_relationships`');
            SIGNAL SQLSTATE 'ERROR';
        END IF;
    END IF;

    /*
    #3 If given categories and artists, run that FN and store the return keys into a temp table
    */
    IF mediaArtists IS NOT NULL OR mediaCategories IS NOT NULL THEN

        SET @MoreArtistsThanCategoriesFlag = IF(
            (LENGTH(mediaArtists) - LENGTH(REPLACE(mediaArtists, ',', ''))) >= (LENGTH(mediaCategories) - LENGTH(REPLACE(mediaCategories, ',', ''))),
                1,
                0
        );
        SET @MetaMajorityStandalone = IF(@MoreArtistsThanCategoriesFlag = 1, mediaArtists, mediaCategories);
        SET @MetaMinorityStandalone = IF(@MoreArtistsThanCategoriesFlag = 0, mediaArtists, mediaCategories);

        SET @MetaMajority = @MetaMajorityStandalone ;
        SET @MetaMinority = @MetaMinorityStandalone ;

        SET @CurrentMinorityItem = IF(
                LOCATE(',', @MetaMinority) > 0,
                    SUBSTRING_INDEX(@MetaMinority, ',', 1),
                    @MetaMinority
            );

        
        WHILE @MetaMinority IS NOT NULL DO 
        
            SET @CurrentMajorityItem = IF(
                    LOCATE(',', @MetaMajority) > 0,
                        SUBSTRING_INDEX(@MetaMajority, ',', 1),
                        @MetaMajority
                );
            

            IF ISNULL(@CurrentMajorityItem) THEN
                -- if the current maj item is null then increment our minority item, reset majority, and rerun
                SET @MetaMajority = @MetaMajorityStandalone ;
                -- handle the minorities
                IF @MetaMinority = @CurrentMinorityItem THEN
                    -- we have nothing further to loop in our minority, set it to null and exit
                    SET @MetaMinority = NULL;
                ELSE
                    -- reset our minority item and remove current from our minority list
                    SET @MetaMinority = IF(
                        LOCATE(',', @MetaMinority) > 0,
                            SUBSTRING(@MetaMinority, LOCATE(',', @MetaMinority) + 1),
                            @MetaMinority
                    );
                    SET @CurrentMinorityItem = IF(
                        LOCATE(',', @MetaMinority) > 0,
                            SUBSTRING_INDEX(@MetaMinority, ',', 1),
                            @MetaMinority
                    );
                END IF;
            ELSE
                -- All of our above checks passed, add the meta entry, append its id to the list, move forward
                SET @NewMetaId = ( 
                    SELECT meta_row_insert( 
                        TRIM(IF(@MoreArtistsThanCategoriesFlag = 1, @CurrentMajorityItem, @CurrentMinorityItem)), 
                        TRIM(IF(@MoreArtistsThanCategoriesFlag = 0, @CurrentMajorityItem, @CurrentMinorityItem))
                    ) 
                );
                SET MediaMetaIdList = IF(
                        ISNULL(MediaMetaIdList),
                            LTRIM(@NewMetaId),
                            CONCAT(MediaMetaIdList, ',', @NewMetaId)
                    );
                
                SET @MetaMajority = IF(
                        LOCATE(',', @MetaMajority) > 0,
                            SUBSTRING(@MetaMajority, LOCATE(',', @MetaMajority) + 1),
                            NULL
                    );
                
            END IF;

        END WHILE;
        
    END IF;


    /*
    #4. Loop through the given `mediaEntries`, 
    persist in `media` and 
    set relations in `media_relationships`
    */
    SET Jndex = 0;
    REPEAT
        SET @EntryIndex = JSON_EXTRACT(mediaEntries, CONCAT('$[', Jndex, '].index'));
        SET @EntryTitle = JSON_EXTRACT(mediaEntries, CONCAT('$[', Jndex, '].title'));
        SET @EntryFilename = JSON_EXTRACT(mediaEntries, CONCAT('$[', Jndex, '].filename'));
        
        SET @NewEntryId = set_media_entry( 
                TRIM(BOTH '"' FROM @EntryTitle), 
                TRIM(BOTH '"' FROM @EntryFilename),
                TRIM(TRAILING '/' FROM relativeUrl), 
                TRIM(BOTH '"' FROM coverImageUri), 
                SourceId 
            );
        SET @MediaEntryMeta = MediaMetaIdList;
        
        WHILE @MediaEntryMeta IS NOT NULL DO
        
            INSERT IGNORE INTO
                media_meta(media_id, meta_id)
            VALUES(
                @NewEntryId,
                (
                    SELECT id FROM meta WHERE CONVERT(id, CHAR) = IF(
                            LOCATE(',', @MediaEntryMeta) > 0,
                                SUBSTRING_INDEX(@MediaEntryMeta, ',', 1),
                                @MediaEntryMeta
                        )
                )
            );

            SET @MediaEntryMeta = IF(
                    LOCATE(',', @MediaEntryMeta) > 0,
                        SUBSTRING(@MediaEntryMeta, LOCATE(',', @MediaEntryMeta) + 1),
                        NULL
                );
        END WHILE;
        
        INSERT IGNORE INTO 
            bundle_media(bundle_id, media_id, media_index)
        VALUES ( BundleId, @NewEntryId, @EntryIndex );

        SET Jndex = Jndex + 1;
        UNTIL Jndex = JSON_LENGTH(mediaEntries)
    END REPEAT;

END//
DELIMITER ;

/* 
CALL media_bundle_entry_set_relationships(
    -- IN sourceUrl TEXT  , --
    '/home/benjamyan/Working/media-server/media/audio',
    --  IN relativeUrl TEXT, --  
    '/barren_earth/barren_earth_2009_our_twilight_ep/',
    --  IN mainTitle TEXT, --  
    'Our Twilight EP',
    --  IN subTitle TEXT, --  
    'EP',
    --  IN coverImageUri TEXT, --  
    'cover.jpg',
    --  IN mediaEntries JSON, --  
    '[{"index":0,"filename":"01_our_twilight.mp3","title":"Our Twilight"},{"index":1,"filename":"02_jewel.mp3","title":"Jewel"},{"index":2,"filename":"03_flame_of_serenity.mp3","title":"Flame of Serenity"},{"index":3,"filename":"04_floodred.mp3","title":"Floodred"}]',
    --  IN mediaArtists TEXT, --  
    'Barren Earth,Lorem ipsum,Dolor',
    --  IN mediaCategories TEXT --  
    'Metal,Black Metal,Pop,Super bop,pringle'
); 
*/
/* 
object schema from crud op
{
  relativeUrl: '/barren_earth/barren_earth_2009_our_twilight_ep/',
  entries: [
    {
      index: 0,
      filename: '01_our_twilight.mp3',
      title: 'Our Twilight'
    },
    { index: 1, filename: '02_jewel.mp3', title: 'Jewel' },
    {
      index: 2,
      filename: '03_flame_of_serenity.mp3',
      title: 'Flame of Serenity'
    },
    { index: 3, filename: '04_floodred.mp3', title: 'Floodred' },
    { index: 4, filename: 'cover.jpg', title: 'Cover' }
  ],
  coverImageUri: 'cover.jpg',
  title: 'Our Twilight EP',
  subtitle: 'EP',
  type: 'album',
  artists: [ 'Barren Earth' ],
  categories: [ 'Metal', 'Black Metal' ],
  sourceUrl: '/home/benjamyan/Working/media-server/media/audio'
} 
*/
