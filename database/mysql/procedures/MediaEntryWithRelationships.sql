DROP PROCEDURE IF EXISTS media_bundle_entry_with_relationships ;

DELIMITER //
CREATE PROCEDURE media_entry_with_relationships 
(
    IN sourceUrl TEXT,
    IN relativeUrl TEXT,
    IN mainTitle TEXT,
    IN subTitle TEXT,
    IN coverImageUri TEXT,
    IN totalEntries JSON,
    IN mediaArtists TEXT,
    IN mediaCategories TEXT
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

                SET @NewEntry = (
                    SELECT set_bundle_entry('lorem','domas')
                );
                
                IF mediaArtists IS NOT NULL OR mediaCategories IS NOT NULL THEN
                    CALL meta_info_insert(mediaArtists, mediaCategories);
                END IF;

                CALL create_media_relation(@NewEntry, mediaCategories, mediaArtists);
            END IF;

        ELSE
            SIGNAL SQLSTATE '45612' SET MESSAGE_TEXT = 'A media entry for this item already exists';
        END IF;
        
    END IF;

END//
DELIMITER ;


/* CALL media_bundle_entry_with_relationships (
    'Movies',
    'Spongebob Poopants', 
    NULL, 
    'spongebob/season3', 
    15,
    'comedy,action,violence',
    'spongebob,sandy'
); */