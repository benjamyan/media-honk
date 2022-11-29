DROP PROCEDURE IF EXISTS meta_info_insert;

/*

- If first param is empty, set the @state to 2 and the @meta var to second param
- If second param is empty, exit whole tghing with error

Proceedure for both datasets present:
1. Create temp table containing the same col as our `meta` table in db
2. Add our given items into temp table from a LOCATE statement against ',' seperators
    a. At this point only the TEXT cols should have entries in temp table
3. Run check against our meta db table for the entries
    a. if an entry is present matching the table, proceed
    b. if entry for only one col exists, insert (into temp) its key value as id and remove its text entry 
4. Inser the finalized temp entry into our db table 
5. End --
    a. Delete the temp table
    b. Remove the current artist and category from the given params
    c. Call proceedure with new params

*/

DELIMITER //
CREATE PROCEDURE meta_info_insert (
    IN metaArtists TEXT,
    IN metaCategories TEXT
)
BEGIN
    
    /* 
        Set our initial check for given params - check against empty params 
        0 = no usable data
        1 = artists data present only
        2 = category data present only
        3 = both category and artist data present
    */
    SET @Given = 0;
    IF LENGTH(metaArtists) > 0 THEN
        @Given = @Given + 1;
    END IF;
    IF LENGTH(metaCategories) > 0 THEN
        @Given = @Given + 2;
    END IF;

    IF @Given != 0 THEN

        /* #1 */
        CREATE TEMPORARY TABLE IF NOT EXISTS `given_meta` LIKE `medialan.meta` LIMIT 1;
        
        /* #2 */
        INSERT INTO given_meta (artist, category)
            VALUES(
                IF(
                    LOCATE(',', metaArtists) > 0, 
                        SUBSTRING_INDEX(metaArtists, ',', 1), 
                        metaArtists
                ),
                IF(
                    LOCATE(',', metaCategories) > 0, 
                        SUBSTRING_INDEX(metaCategories, ',', 1), 
                        metaCategories 
                )
            );
        SET @NewMetaId = LAST_INSERT_ID();
        SET @NewMeta = (
            SELECT * FROM given_meta WHERE id = @NewMetaId
        );

        /* #3 */
        UPDATE given_meta
            SET 
                artist_id = SELECT id FROM medialan.meta WHERE arist = @NewMeta(artist),
                category_id = SELECT id FROM medialan.meta WHERE category = @NewMeta(category)
            WHERE
                id = @NewMetaId;
        UPDATE given_meta
            SET 
                artist = IF(@NewMeta(artist_id) IS NOT NULL, NULL, artist),
                category = IF(@NewMeta(category_id) IS NOT NULL, NULL, category)
            WHERE 
                id = @NewMetaId;

        /* SET @Artist = IF( 
            LOCATE(',', metaArtists) > 0, 
                SUBSTRING_INDEX(metaArtists, ',', 1), 
                metaArtists
        );
        SET @Category = IF( 
            LOCATE(',', metaCategories) > 0, 
                SUBSTRING_INDEX(metaCategories, ',', 1), 
                metaCategories
        );
        SET @ArtistId = (
            SELECT id FROM medialan.meta WHERE arist = @Artist
        );
        SET @CategoryId = (
            SELECT id FROM medialan.meta WHERE category = @Category
        );
        INSERT INTO given_meta (artist, artist_id, category, category_id)
            VALUES(
                IF(@ArtistId IS NOT NULL, NULL, artist),
                @ArtistId,
                IF(@CategoryId IS NOT NULL, NULL, category),
                @CategoryId
            ); */
        
        DROP TEMPORARY TABLE given_meta;
        CALL meta_info_insert(
            IF(
                LOCATE(',', metaArtists) > 0, 
                    SUBSTRING(metaArtists, LOCATE(',', metaArtists) + 1), 
                    NULL
            ),
            IF(
                LOCATE(',', metaCategories) > 0, 
                    SUBSTRING(metaCategories, LOCATE(',', metaCategories) + 1),
                    NULL
            )
        );
                
    ELSE IF @Given < 0 OR @Given > 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'An unhandled exception occured inside stored proceedure `meta_info_insert`';
    END IF;

END//
DELIMITER ;

/* CALL dynamic_multi_insert('comedy,action,violence,drama,poopoo', 'category', 'id', 'name', 1); */
