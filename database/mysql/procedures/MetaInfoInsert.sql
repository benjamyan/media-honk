DROP PROCEDURE IF EXISTS meta_info_insert;

/*

- If first param is empty, set the @state to 2 and the @meta var to second param
- If second param is empty, exit whole tghing with error

        Set our initial check for given params - check against empty params 
        0 = no usable data
        1 = artists data present only
        2 = category data present only
        3 = both category and artist data present

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

    SET @Given = 0;
    IF LENGTH(metaArtists) > 0 THEN
        SET @Given = @Given + 1;
    END IF;
    IF LENGTH(metaCategories) > 0 THEN
        SET @Given = @Given + 2;
    END IF;
    
    IF @Given != 0 THEN
    
        CREATE TEMPORARY TABLE IF NOT EXISTS given_meta LIKE meta;
        
        SET @GivenArtists = metaArtists;
        SET @GivenCategories = metaCategories;

        WHILE @GivenArtists IS NOT NULL OR @GivenCategories IS NOT NULL DO

            SET @CurrentArtist = IF(
                LOCATE(',', @GivenArtists) > 0, 
                    SUBSTRING_INDEX(@GivenArtists, ',', 1), 
                    @GivenArtists
            );
            SET @CurrentCategory = IF(
                LOCATE(',', @GivenCategories) > 0, 
                    SUBSTRING_INDEX(@GivenCategories, ',', 1), 
                    @GivenCategories
            );

            INSERT INTO 
                given_meta
            SET
                artist_id = (
                    SELECT meta.id FROM meta WHERE meta.artist_name = @CurrentArtist
                ),
                category_id = (
                    SELECT meta.id FROM meta WHERE meta.category_name = @CurrentCategory
                ),
                artist_name = IF(artist_id IS NOT NULL, NULL, @CurrentArtist),
                category_name = IF(category_id IS NOT NULL, NULL, @CurrentCategory);
                
            INSERT INTO 
                meta(artist_name, artist_id, category_name, category_id)
            SELECT
                artist_name,
                artist_id,
                category_name,
                category_id
            FROM
                given_meta
            WHERE 
                given_meta.id = LAST_INSERT_ID();
                
            TRUNCATE given_meta;
            SET @GivenArtists = IF(
                LOCATE(',', @GivenArtists) > 0, 
                    SUBSTRING(@GivenArtists, LOCATE(',', @GivenArtists) + 1), 
                    NULL
            );
            SET @GivenCategories = IF(
                LOCATE(',', @GivenCategories) > 0, 
                    SUBSTRING(@GivenCategories, LOCATE(',', @GivenCategories) + 1),
                    NULL
            );

        END WHILE; 

        DROP TEMPORARY TABLE given_meta;

        /* 
        SET @CurrentArtist = IF(
            LOCATE(',', metaArtists) > 0, 
                SUBSTRING_INDEX(metaArtists, ',', 1), 
                metaArtists
        );
        SET @CurrentCategory = IF(
            LOCATE(',', metaCategories) > 0, 
                SUBSTRING_INDEX(metaCategories, ',', 1), 
                metaCategories 
        );
            
        INSERT INTO 
            given_meta
        SET
            artist_id = (
                SELECT meta.id FROM meta WHERE meta.artist_name = @CurrentArtist
            ),
            category_id = (
                SELECT meta.id FROM meta WHERE meta.category_name = @CurrentCategory
            ),
            artist_name = IF(artist_id IS NOT NULL, NULL, @CurrentArtist),
            category_name = IF(category_id IS NOT NULL, NULL, @CurrentCategory);
            
        INSERT INTO 
            meta(artist_name, artist_id, category_name, category_id)
        SELECT
            artist_name,
            artist_id,
            category_name,
            category_id
        FROM
            given_meta
        WHERE 
            given_meta.id = LAST_INSERT_ID();
            
        DELETE * FROM given_meta;
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
        */
        
    END IF;
    
END//
DELIMITER ;

CALL meta_info_insert(
    'lorem,ipsum,dolor sit,lorem,consectetor',
    'domas,lamprey,lamprey,kins met,tempo'
);
