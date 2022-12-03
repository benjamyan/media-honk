DROP FUNCTION IF EXISTS set_media_entry;

DELIMITER //
CREATE FUNCTION set_media_entry(
    givenName TEXT,
    relativeUrl TEXT,
    coverImgUrl TEXT,
    sourceId INT
) 
RETURNS INT
DETERMINISTIC
BEGIN

    SET @MediaExists = (
        SELECT 
            id 
        FROM 
            media 
        WHERE
            name = givenName
            AND rel_url = relativeUrl
    );

    IF ISNULL(@MediaExists) THEN
        INSERT INTO
            media (
                name,
                rel_url,
                cover_img_uri,
                source_id
            )
        VALUES (
                givenName,
                relativeUrl,
                coverImgUrl,
                sourceId 
            );
        SET @NewMediaId = LAST_INSERT_ID();
        RETURN (@NewMediaId);
    ELSE
        RETURN (@MediaExists);
    END IF;

END//
DELIMITER ;
