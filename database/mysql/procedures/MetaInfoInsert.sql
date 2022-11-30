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
            
            SELECT single_meta_insert(
                @CurrentArtist,
                @CurrentCategory
            );
            
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
        
    END IF;
    
END//
DELIMITER ;

/* CALL meta_info_insert(
    'lorem,ipsum,dolor sit,lorem,consectetor',
    'domas,lamprey,lamprey,kins met,tempo'
); */
