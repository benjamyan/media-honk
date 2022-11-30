DROP FUNCTION IF EXISTS set_bundle_entry;

DELIMITER //
CREATE FUNCTION set_bundle_entry(
    name TEXT NOT NULL,
    relativeUrl TEXT NOT NULL,
    posterImg TEXT,
    entriesNum INT NOT NULL
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
                rel_url, 
                poster_img_uri, 
                entries 
            )
        VALUES (
                title TEXT NOT NULL, 
                subtitle TEXT, 
                relativeUrl TEXT NOT NULL, 
                posterImg TEXT, 
                entriesNum INT NOT NULL 
            );
        SET @NewBundleId = LAST_INSERT_ID();
        RETURN (@NewBundleId);
    ELSE
        RETURN (@BundleExists);
    END IF;

END//
DELIMITER ;

SELECT set_bundle_entry(
    'lorem',
    'domas'
);
