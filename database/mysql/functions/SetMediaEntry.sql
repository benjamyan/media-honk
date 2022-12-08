DROP FUNCTION IF EXISTS set_media_entry;

DELIMITER //
CREATE FUNCTION set_media_entry(
    mediaTitle TEXT,
    mediaFilename TEXT,
    relativeUrl TEXT,
    coverImg TEXT,
    sourceId INT
) 
RETURNS INT
DETERMINISTIC
BEGIN

    DECLARE MediaRowId INT unsigned DEFAULT NULL;
    DECLARE RelUrlId INT unsigned DEFAULT NULL;
    DECLARE CoverImgId INT unsigned DEFAULT NULL;

    DECLARE CoverImgUrl TEXT DEFAULT CONCAT(relativeUrl, '/', coverImg);

    DECLARE RetryDeclare TEXT DEFAULT 'URL';
    DECLARE CONTINUE HANDLER FOR SQLSTATE 'RETRY'
        BEGIN
            IF RetryDeclare = 'URL' THEN
                    SET RelUrlId = (
                        SELECT id FROM media WHERE rel_url = relativeUrl
                    );
            ELSEIF RetryDeclare = 'MEDIA' THEN
                    SET MediaRowId = (
                        SELECT id FROM media WHERE title = mediaTitle AND (rel_url = relativeUrl OR rel_url_id = RelUrlId)
                    );
            ELSEIF  RetryDeclare = 'COVER' THEN
                SET CoverImgId = (
                    SELECT id FROM covers WHERE file_url = CoverImgUrl AND source_id = sourceId
                );
            END IF;
        END;
    SET RetryDeclare = 'URL';
    SIGNAL SQLSTATE 'RETRY';
    SET RetryDeclare = 'MEDIA';
    SIGNAL SQLSTATE 'RETRY';
    SET RetryDeclare = 'COVER';
    SIGNAL SQLSTATE 'RETRY';
    
    IF ISNULL(MediaRowId) THEN
    
        IF ISNULL(CoverImgId) THEN
            INSERT INTO 
                covers(file_url, source_id)
            VALUES (
                CoverImgUrl,
                sourceId
            );
            SET RetryDeclare = 'COVER';
            SIGNAL SQLSTATE 'RETRY';
        END IF;

        INSERT INTO
            media (
                title,
                filename,
                rel_url,
                rel_url_id,
                cover_img_id,
                source_id
            )
        VALUES (
                mediaTitle,
                mediaFilename,
                IF(ISNULL(RelUrlId), relativeUrl, NULL),
                RelUrlId,
                CoverImgId,
                sourceId 
            );
        SET RetryDeclare = 'MEDIA';
        SIGNAL SQLSTATE 'RETRY';
    END IF;

    RETURN (MediaRowId);

END//
DELIMITER ;
