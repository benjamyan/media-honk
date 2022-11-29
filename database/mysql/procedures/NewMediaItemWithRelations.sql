DROP PROCEDURE IF EXISTS complete_entry_from_data;

DELIMITER //
CREATE PROCEDURE complete_entry_from_data 
(
    IN sourceUrl TEXT,
    IN relativeUrl TEXT,
    IN mainTitle TEXT,
    IN subTitle TEXT,
    IN coverImageUri TEXT,
    IN totalEntries JSON,
    IN mediaCategories TEXT,
    IN mediaArtists TEXT
)
BEGIN
    IF sourceUrl IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'sourceUrl cannot be NULL';
    ELSEIF mainTitle IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'mainTitle cannot be NULL';
    ELSEIF relativeUrl IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'relativeUrl cannot be NULL';
    ELSE 
        SET @NewEntry = (
            SELECT id 
            FROM media
            WHERE (
                main_title = mainTitle
                AND sub_title <=> subTitle
                AND rel_url = relativeUrl
            )
            LIMIT 1
        );
        
        IF @NewEntry IS NULL THEN

            SET @SourceID = ( SELECT src.id FROM source AS src WHERE src.abs_url = sourceUrl );

            IF @SourceID IS NULL THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SourceID cannot be NULL';
            ELSE

                INSERT INTO media (main_title, sub_title, cover_img_uri, rel_url, entries, source_id)
                    VALUES(mainTitle, subTitle, coverImageUri, relativeUrl, totalEntries, @SourceID);

                SET @NewEntry = LAST_INSERT_ID();
                SET @Meta = NULL;

                /* IF mediaCategories IS NOT NULL THEN
                    SET @Meta = mediaCategories;
                    SET @Current = 's';
                    WHILE @Current != '' DO
                        SET @Current = SUBSTRING_INDEX(@Meta, ',', 1);
                        SET @Exists = ( 
                            SELECT id FROM category AS cat WHERE cat.name = @Current 
                        );

                        IF @Exists IS NULL THEN
                            INSERT INTO category (name, source_id) VALUES (@Current, @SourceID);
                        END IF;

                        IF LOCATE(',', @Meta) > 0 THEN
                            SET @Meta = SUBSTRING(@Meta, LOCATE(',', @Meta) + 1);
                        ELSE
                            SET @Current = '';
                        END IF;
                    END WHILE;
                END IF; */

                /* IF mediaArtists IS NOT NULL THEN
                    SET @Meta = mediaArtists;
                    SET @Current = 's';
                    WHILE @Current != '' DO
                        SET @Current = SUBSTRING_INDEX(@Meta, ',', 1);
                        SET @Exists = ( 
                            SELECT id FROM artist AS art WHERE art.name = @Current 
                        );

                        IF @Exists IS NULL THEN
                            INSERT INTO artist (name, source_id) VALUES (@Current, @SourceID);
                        END IF;

                        IF LOCATE(',', @Meta) > 0 THEN
                            SET @Meta = SUBSTRING(@Meta, LOCATE(',', @Meta) + 1);
                        ELSE
                            SET @Current = '';
                        END IF;
                    END WHILE;
                END IF; */
                
                CALL create_media_relation(@NewEntry, mediaCategories, mediaArtists);
            END IF;

        ELSE
            SIGNAL SQLSTATE '45612' SET MESSAGE_TEXT = 'A media entry for this item already exists';
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