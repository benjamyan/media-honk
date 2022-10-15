DROP PROCEDURE IF EXISTS create_media_relation;

DELIMITER //
CREATE PROCEDURE create_media_relation (
    mediaId INT,
    mediaCategories TEXT,
    mediaArtists TEXT,
    sourceId INT
)
BEGIN
    IF mediaId IS NOT NULL AND sourceId IS NOT NULL THEN
        SET @Cat = mediaCategories;
        SET @Art = mediaArtists;
        WHILE @Cat IS NOT NULL OR @Art IS NOT NULL DO
            INSERT INTO media_relation (media_id, category_id, artist_id, source_id)
                VALUES (
                    mediaId, 
                    (
                        SELECT id 
                        FROM category 
                        WHERE name = IF(
                            LOCATE(',', @Cat) > 0, 
                            SUBSTRING_INDEX(@Cat, ',', 1), 
                            @Cat
                        )
                    ), 
                    (
                        SELECT id 
                        FROM artist 
                        WHERE name = IF(
                            LOCATE(',', @Art) > 0, 
                            SUBSTRING_INDEX(@Art, ',', 1), 
                            @Art
                        )
                    ),
                    sourceId
                );
            SET @Cat = IF(
                LOCATE(',', @Cat) > 0,
                    SUBSTRING(@Cat, LOCATE(',', @Cat) + 1),
                    NULL
            );
            SET @Art = IF(
                LOCATE(',', @Art) > 0,
                    SUBSTRING(@Art, LOCATE(',', @Art) + 1),
                    NULL
            );
        END WHILE;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'mediaId and sourceId cannot be NULL';
    END IF;

END//
DELIMITER ;

/* CALL create_media_relation(5, 'comedy,action', 'bill,tedd,mike', 2); */
