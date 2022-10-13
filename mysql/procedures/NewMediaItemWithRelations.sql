DROP PROCEDURE IF EXISTS create_media_relation;
DELIMITER //
CREATE PROCEDURE create_media_relation (
    mediaItemId INT,
    categoryName TEXT,
    artistName TEXT,
    sourceTitle TEXT
)
BEGIN
    SET @CategoryID = (
        SELECT cat.id FROM category AS cat
        WHERE cat.name = categoryName
    );
    SET @ArtistID = (
        SELECT art.id FROM source AS art
        WHERE art.title = artistName
    )
    SET @SourceID = (
        SELECT src.id FROM source AS src
        WHERE src.title = sourceTitle
    );
    IF @SourceID IS NOT NULL AND @CategoryID IS NOT NULL THEN 
        INSERT INTO media_relation (media_id, category_id, artist_id, source_id) 
            VALUES (mediaItemId, @CategoryID, @ArtistID, @SourceID);
    END IF;
END//
DELIMITER ;



DROP PROCEDURE IF EXISTS dynamic_multi_insert;
DELIMITER //
CREATE PROCEDURE dynamic_multi_insert (
    IN mediaMeta TEXT,
    IN tableName TEXT,
    IN tableCol TEXT
)
BEGIN
    SET @Meta = mediaMeta;
    SET @Exists = NULL;
    SET @Current = 's';

    SET @Statement1 = CONCAT('SELECT id INTO @Exists FROM ', tableName, ' WHERE ', tableCol, ' = @Current');
    SET @Statement2 = CONCAT('INSERT INTO ', tableName, ' (', tableCol, ') VALUES (@Current)');

    WHILE @Current != '' DO
        SET @Current = SUBSTRING_INDEX(@Meta, ',', 1);
        
        PREPARE stmt1 FROM @Statement1;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;
        
        IF @Exists IS NULL THEN
            PREPARE stmt2 FROM @Statement2;
            EXECUTE stmt2;
            DEALLOCATE PREPARE stmt2;
        ELSE
            SET @Exists = NULL;
        END IF;

        IF LOCATE(',', @Meta) > 0 THEN
            SET @Meta = SUBSTRING(@Meta, LOCATE(',', @Meta) + 1);
        ELSE
            SET @Current = '';
        END IF;
    END WHILE;
END//
DELIMITER ;
/* CALL dynamic_multi_insert('comedy,action,violence,drama,poopoo', 'artist', 'name'); */



DROP PROCEDURE IF EXISTS complete_entry_from_data;
DELIMITER //
CREATE PROCEDURE complete_entry_from_data 
(
    IN mainTitle TEXT,
    IN subTitle TEXT,
    IN assetPath TEXT,
    IN totalEntries INT UNSIGNED,
    IN mediaCategories TEXT,
    IN mediaArtists TEXT,
    IN mediaSource TEXT
)
BEGIN
    SET @NewEntry = (
        SELECT id FROM media
        WHERE main_title = mainTitle
        AND sub_title = subTitle
        AND asset_path = assetPath
    );
    IF @NewEntry IS NULL THEN

        INSERT INTO media (main_title, sub_title, asset_path, entries)
            VALUES(mainTitle, subTitle, assetPath, totalEntries);

        SET @NewEntry = LAST_INSERT_ID();

        IF mediaCategories IS NOT NULL THEN
            CALL dynamic_multi_insert(mediaCategories, 'category', 'name');
        END IF;

        IF mediaArtists IS NOT NULL THEN
            CALL dynamic_multi_insert(mediaArtists, 'artist', 'name');
        END IF;

    END IF;



    /* SET @CurrentEntry = (
        SELECT @NewEntry
        FROM media_relation
        WHERE media_id = @NewEntry 
    );
    IF @CurrentEntry IS NULL THEN

        IF 

        SET @Meta = mediaMeta;
        SET @Exists = NULL;
        SET @Current = 1;
        
        WHILE @Current < LOCATE(',', @Meta) DO 

            SET @Current = SUBSTRING_INDEX(@Meta, ',', 1);


            
            IF @Exists IS NULL THEN
                
            ELSE
                SET @Exists = NULL;
            END IF;

            IF LOCATE(',', @Meta) > 0 THEN
                SET @Meta = SUBSTRING(@Meta, LOCATE(',', @Meta) + 1);
            ELSE
                SET @Current = '';
            END IF;

        END WHILE;

        CALL create_media_relation(@NewMediaEntryId, 'comedy', 'TV Series');
    ELSE 
        
    END IF; */

END//
DELIMITER ;

/* CALL complete_entry_from_data(
    'Spongebob Poopants', 
    NULL, 
    'spongebob/season3', 
    15,
    'comedy,action,violence',
    NULL,
    'Movies'
); */