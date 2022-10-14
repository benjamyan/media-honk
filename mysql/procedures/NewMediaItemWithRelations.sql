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
    IF mediaSource IS NOT NULL AND mainTitle IS NOT NULL AND assetPath IS NOT NULL THEN

        SET @NewEntry = (
            SELECT id 
            FROM media
            WHERE (
                main_title = mainTitle
                AND sub_title = subTitle
                AND asset_path = assetPath
            )
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

    END IF;

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