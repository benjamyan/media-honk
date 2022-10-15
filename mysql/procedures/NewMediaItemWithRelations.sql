DROP PROCEDURE IF EXISTS complete_entry_from_data;

DELIMITER //
CREATE PROCEDURE complete_entry_from_data 
(
    IN mediaSource TEXT,
    IN mainTitle TEXT,
    IN subTitle TEXT,
    IN assetPath TEXT,
    IN totalEntries INT UNSIGNED,
    IN mediaCategories TEXT,
    IN mediaArtists TEXT
)
BEGIN
    IF mediaSource IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'mediaSource cannot be NULL';
    ELSEIF mainTitle IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'mainTitle cannot be NULL';
    ELSEIF assetPath IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'assetPath cannot be NULL';
    ELSE 
        SET @NewEntry = (
            SELECT id 
            FROM media
            WHERE (
                main_title = mainTitle
                AND sub_title <=> subTitle
                AND asset_path = assetPath
            )
            LIMIT 1
        );
        
        IF @NewEntry IS NULL THEN

            INSERT INTO media (main_title, sub_title, asset_path, entries)
                VALUES(mainTitle, subTitle, assetPath, IF(totalEntries IS NULL, 1, totalEntries));

            SET @NewEntry = LAST_INSERT_ID();
            SET @SourceID = (
                SELECT src.id 
                FROM source AS src
                WHERE src.title = mediaSource
            );

            IF mediaCategories IS NOT NULL THEN
                CALL dynamic_multi_insert(mediaCategories, 'category', 'id', 'name', 0);
            END IF;

            IF mediaArtists IS NOT NULL THEN
                CALL dynamic_multi_insert(mediaArtists, 'artist', 'id', 'name', 0);
            END IF;

            CALL create_media_relation(@NewEntry, mediaCategories, mediaArtists, @SourceID);

        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A media entry for this item already exists';
        END IF;
        
    END IF;

END//
DELIMITER ;

/* CALL complete_entry_from_data(
    'Movies',
    'Spongebob Poopants', 
    NULL, 
    'spongebob/season3', 
    15,
    'comedy,action,violence',
    'spongebob,sandy'
); */