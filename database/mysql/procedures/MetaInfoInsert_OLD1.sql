DROP PROCEDURE IF EXISTS meta_info_insert;

/*

- If first param is empty, set the @state to 2 and the @meta var to second param
- If second param is empty, exit whole tghing with error

        Set our initial check for given params - check against empty params 
        0 = no usable data
        1 = artists data present only
        2 = category data present only
        3 = both category and artist data present
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
        
            SELECT single_meta_row_insert(
                IF(
                    LOCATE(',', @GivenArtists) > 0, 
                        SUBSTRING_INDEX(@GivenArtists, ',', 1), 
                        @GivenArtists
                ),
                IF(
                    LOCATE(',', @GivenCategories) > 0, 
                        SUBSTRING_INDEX(@GivenCategories, ',', 1), 
                        @GivenCategories
                )
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
