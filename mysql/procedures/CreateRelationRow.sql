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
    );
    SET @SourceID = (
        SELECT src.id FROM source AS src
        WHERE src.title = sourceTitle
    );
    /* IF @SourceID IS NOT NULL AND @CategoryID IS NOT NULL THEN  */
    INSERT INTO media_relation (media_id, category_id, artist_id, source_id) 
        VALUES (mediaItemId, @CategoryID, @ArtistID, @SourceID);
    /* END IF; */
END//
DELIMITER ;


