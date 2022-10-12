DROP PROCEDURE IF EXISTS create_media_relation;
DELIMITER //
CREATE PROCEDURE create_media_relation (
    mediaItemId INT,
    categoryName TEXT,
    sourceTitle TEXT
)
BEGIN
    SET @CategoryID = (
        SELECT cat.id 
        FROM category AS cat
        WHERE cat.name = categoryName
    );
    SET @SourceID = (
        SELECT src.id 
        FROM source AS src
        WHERE src.title = sourceTitle
    );
    IF @SourceID IS NOT NULL AND @CategoryID IS NOT NULL THEN 
        INSERT INTO media_relation (media_id, category_id, source_id) 
            VALUES (mediaItemId, @CategoryID, @SourceID);
    END IF;
END//
DELIMITER ;



DROP PROCEDURE IF EXISTS conditional_category_insert;
DELIMITER //
CREATE PROCEDURE conditional_category_insert (
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
            SELECT 'next' ;
            SET @Meta = SUBSTRING(@Meta, LOCATE(',', @Meta) + 1);
        ELSE
            SELECT 'bye' ;
            SET @Current = '';
        END IF;
    END WHILE;
END//
/* CALL conditional_category_insert('comedy,action,violence,drama,poopoo', 'artist', 'name'); */
DELIMITER ;



DROP PROCEDURE IF EXISTS new_media_entry;
DELIMITER //
CREATE PROCEDURE new_media_entry 
(
    mainTitle TEXT,
    subTitle TEXT,
    assetPath TEXT,
    totalEntries INT unsigned,
    mediaCategories TEXT,
    mediaArtists TEXT
)
BEGIN
    SET @NewEntry = (
        SELECT id FROM media
        WHERE main_title = mainTitle
        AND sub_title = subTitle
        AND asset_path = assetPath
    );

    IF @NewEntry IS NULL THEN
    
        INSERT IGNORE INTO media (main_title, sub_title, asset_path, entries)
            VALUES(mainTitle, subTitle, assetPath, totalEntries);
        SET @NewMediaEntryId = LAST_INSERT_ID();
        CALL create_media_relation(@NewMediaEntryId, 'comedy', 'TV Series');

    END IF;

END//
DELIMITER ;

/* CALL new_media_entry(
    'Spongebob Poopants', 
    NULL, 
    'spongebob/season3', 
    15,
    'comedy,action,violence',
    NULL
); */