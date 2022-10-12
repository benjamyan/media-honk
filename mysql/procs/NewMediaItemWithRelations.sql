DROP PROCEDURE IF EXISTS entry_point;
DROP FUNCTION IF EXISTS new_media_entry;
DROP PROCEDURE IF EXISTS conditional_relation_insert;

DELIMITER //
CREATE PROCEDURE conditional_relation_insert (
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
CREATE PROCEDURE entry_point 
(
    mainTitle TEXT,
    subTitle TEXT,
    assetPath TEXT,
    totalEntries INT unsigned   
)
BEGIN
    SET @NewEntry = (
        SELECT * FROM media
        WHERE main_title = mainTitle
        AND sub_title = subTitle
        AND asset_path = assetPath
        AND entries = totalEntries
    );
    IF @NewEntry IS NOT NULL THEN
        SELECT 'yep'
    ELSE
        INSERT IGNORE INTO media (main_title, sub_title, asset_path, entries)
            VALUES(mainTitle, subTitle, assetPath, totalEntries);
    END IF;
    
    SET @NewMediaEntryId = LAST_INSERT_ID();
    CALL conditional_relation_insert(@NewMediaEntryId, 'comedy', 'TV Series');
END//
DELIMITER ;

CALL entry_point('Spongebob Poopants', 's3', 'spongebob/s3', 15)
/* CALL conditional_relation_insert(@newEntry, 'comedy', 'TV Series'); */