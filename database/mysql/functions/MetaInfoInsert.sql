DROP FUNCTION IF EXISTS meta_info_insert;

/*

- If first param is empty, set the @state to 2 and the @meta var to second param
- If second param is empty, exit whole tghing with error

        Set our initial check for given params - check against empty params 
        0 = no usable data
        1 = artists data present only
        2 = category data present only
        3 = both category and artist data present
*/

DELIMITER //
CREATE FUNCTION meta_info_insert(
    metaArtists TEXT,
    metaCategories TEXT
)
RETURNS TEXT
DETERMINISTIC
BEGIN

    /* SET @Given = 0;
    IF LENGTH(metaArtists) > 0 THEN
        SET @Given = @Given + 1;
    END IF;
    IF LENGTH(metaCategories) > 0 THEN
        SET @Given = @Given + 2;
    END IF;
    
    IF @Given != 0 THEN */
    
        -- Var holding our keys/ids
        SET @NewMetaEntries = '';
        -- 
        SET @GivenArtists = metaArtists;
        SET @GivenCategories = metaCategories;

        CREATE TEMPORARY TABLE IF NOT EXISTS meta_row LIKE meta;

        WHILE LENGTH(@GivenArtists) > 0 OR LENGTH(@GivenCategories) > 0 DO
    
            -- Set local variables for usage
            SET @CurrentArtist = IF(
                LOCATE(',', @GivenArtists) > 0, 
                    SUBSTRING_INDEX(@GivenArtists, ',', 1), 
                    @GivenArtists
            );
            SET @CurrentCategory = IF(
                LOCATE(',', @GivenCategories) > 0, 
                    SUBSTRING_INDEX(@GivenCategories, ',', 1), 
                    @GivenCategories
            );
            
            -- Temp table insert
            INSERT IGNORE INTO 
                meta
            SET
                artist_id = IF(
                    @CurrentArtist is NOT NULL,
                        (
                            SELECT meta.id FROM meta WHERE meta.artist_name = @CurrentArtist
                        ),
                        NULL
                ),
                category_id = IF(
                    @CurrentCategory IS NOT NULL,
                        (
                            SELECT meta.id FROM meta WHERE meta.category_name = @CurrentCategory
                        ),
                        NULL
                ),
                artist_name = IF(artist_id IS NOT NULL, NULL, @CurrentArtist) ,
                category_name = IF(category_id IS NOT NULL, NULL, @CurrentCategory) ;
            /* SET @Temp = (
                SELECT
                    *
                FROM
                    meta_row
                WHERE 
                    meta_row.id = LAST_INSERT_ID()
                ORDER BY 
                    id
                LIMIT 2, 1
            ); */


            -- Insert into our meta table
            /* INSERT INTO 
                meta(artist_name, artist_id, category_name, category_id)
            SELECT
                artist_name,
                artist_id,
                category_name,
                category_id 
            FROM
                meta_row
            WHERE 
                meta_row.id = LAST_INSERT_ID(); */
                /* AND (
                    meta_row.artist_name IS NOT NULL 
                    OR meta_row.category_name IS NOT NULL
                ); */

            -- Find the previously inserted row id or get the id of the already existing row
            /* SET @NewEntryId = (
                SELECT 
                    id
                FROM 
                    meta 
                WHERE (
                    artist_name, artist_id, category_name, category_id
                )
                IN (
                    SELECT 
                        artist_name, artist_id, category_name, category_id 
                    FROM 
                        meta_row 
                    WHERE 
                        meta_row.id = LAST_INSERT_ID()
                )
            ); */
            
            
            
            /* IF ISNULL(@NewEntryId) THEN */
            

                /* ON DUPLICATE KEY UPDATE
                    meta.id = LAST_INSERT_ID(); */

                
                
            /* END IF; */
            /* SET @Temp = (
                SELECT
                    artist_name,
                    artist_id,
                    category_name,
                    category_id
                FROM
                    meta_row
                WHERE 
                    meta_row.id = LAST_INSERT_ID()
                LIMIT 1
            ); */
            /* SET @NewEntryId = (
                SELECT 
                    id 
                FROM 
                    meta */
                /* WHERE
                    meta.artist_name = @Temp.artist_name
                    AND meta.artist_id = @Temp.artist_id
                    AND meta.category_name = @Temp.category_name
                    AND meta.category_id = @Temp.category_id */
                /* WHERE (
                    SELECT id
                    FROM meta_row
                    WHERE (
                        meta.artist_name = meta_row.artist_name
                        AND meta.artist_id = meta_row.artist_id
                        AND meta.category_name = meta_row.category_name
                        AND meta.category_id = meta_row.category_id
                    )
                ) */
            /* ); */

            -- Convert and concat to our global value holder
            /* SET @NewEntryId = (
                    SELECT LTRIM(id) FROM meta WHERE meta.id = LAST_INSERT_ID() 
                ); */
            /* SET @NewMetaEntries = CONCAT( @NewMetaEntries, ',', @NewEntryId); */
            /* SET @NewMetaEntries = IF(
                @NewMetaEntries = '',
                    @NewEntryId ,
                    CONCAT( @NewMetaEntries, ',', @NewEntryId)
            ); */
            RETURN ('no');
            
            -- Remove the first item  from the given string concatenation
            SET @GivenArtists = IF(
                LOCATE(',', @GivenArtists) > 0, 
                    SUBSTRING(@GivenArtists, LOCATE(',', @GivenArtists) + 1), 
                    NULL
            );
            SET @GivenCategories = IF(
                LOCATE(',', @GivenCategories) > 0, 
                    SUBSTRING(@GivenCategories, LOCATE(',', @GivenCategories) + 1),
                    NULL
            );

            -- Delete the previously entere row
            DELETE FROM meta_row;
            
        END WHILE; 
        
        DROP TEMPORARY TABLE meta_row;
        
    /* RETURN (@NewMetaEntries); */

END//
DELIMITER ;

SELECT meta_info_insert(
    'lorem,ipsum,dolor sit,lorem,consectetor',
    'domas,lamprey,lamprey,kins met,tempo,lamprey,lamprey'
);
