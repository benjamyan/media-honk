DROP FUNCTION IF EXISTS set_bundle_entry;

DELIMITER //
CREATE FUNCTION set_bundle_entry(
    title TEXT,
    subtitle TEXT,
    mediaId INT unsigned
) 
RETURNS INT
DETERMINISTIC
BEGIN

    SET @BundleExists = (
        SELECT 
            id 
        FROM 
            bundles 
        WHERE
            main_title = title
            AND sub_title = subtitle
    );

    IF ISNULL(@BundleExists) THEN
        INSERT INTO
            bundles (
                main_title, 
                sub_title, 
                cover_img_uri
            )
        VALUES (
                title, 
                subtitle, 
                mediaId
            );
        SET @NewBundleId = LAST_INSERT_ID();
        RETURN (@NewBundleId);
    ELSE
        RETURN (@BundleExists);
    END IF;

END//
DELIMITER ;
