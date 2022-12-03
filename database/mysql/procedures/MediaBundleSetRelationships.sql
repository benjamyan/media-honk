DROP PROCEDURE IF EXISTS media_bundle_entry_set_relationships;

/**
@function media_bundle_row_entry_with_relationships  
- This procedure is so we can take a query against our db and build an entire bundle/relationship for a single media item

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

            SET @SourceID = ( 
                SELECT id FROM source WHERE source.abs_url = sourceUrl 
            );

            IF @SourceID IS NULL THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Source ID cannot be NULL';
            ELSE

                SET @MediaEntry = (
                    SELECT set_media_entry(
                        
                    )
                );

                SET @BundleEntry = (
                    SELECT set_bundle_entry(
                        mainTitle,
                        subTitle,
                        relativeUrl,
                        NULL,
                        0
                    )
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
