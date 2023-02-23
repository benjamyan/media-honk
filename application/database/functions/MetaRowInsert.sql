DROP FUNCTION IF EXISTS meta_row_insert;
/*
This can be done with a inner join/insert select with a cte, but good enough for mvp

OLD docs:
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
CREATE FUNCTION meta_row_insert(
    givenArtistName TEXT,
    givenCategoryName TEXT
) 
RETURNS INT unsigned
DETERMINISTIC
BEGIN

    -- Declare our variables here and run conditions to check for already existing values
    DECLARE ArtistId INT unsigned DEFAULT IF(
            givenArtistName IS NOT NULL,
                (
                    SELECT id FROM meta WHERE meta.artist_name = givenArtistName
                ),
                NULL
        );
    DECLARE CategoryId INT unsigned DEFAULT IF(
            givenCategoryName IS NOT NULL,
                (
                    SELECT id FROM meta WHERE meta.category_name = givenCategoryName
                ),
                NULL
        );
    DECLARE ArtistName TEXT DEFAULT IF(ISNULL(ArtistId), givenArtistName, NULL);
    DECLARE CategoryName TEXT DEFAULT IF(ISNULL(CategoryId), givenCategoryName, NULL);
    
    -- Flag holding our functions state
    DECLARE CompleteFlag TINYINT(1) DEFAULT 0; 
    -- Our final row ID value should be going here for return
    DECLARE MetaRowId INT unsigned DEFAULT NULL;
    DECLARE CONTINUE HANDLER FOR SQLSTATE 'RETRY'
        BEGIN
            /*
            This should only be runnig twice - once on function invokation, 
            another after our INSERT statement
            */
            
            SET MetaRowId = (
                SELECT id
                FROM meta
                WHERE (
                    (
                        artist_name = givenArtistName
                        AND (
                            category_name = givenCategoryName
                            OR category_id = CategoryId
                        )
                    ) OR (
                        category_name = givenCategoryName
                        AND (
                            artist_name = givenArtistName
                            OR artist_id = ArtistId
                        )
                    )
                )
            );

            IF ISNULL(MetaRowId) THEN
                IF ArtistId IS NOT NULL THEN
                    -- Artist is already present in table, we were provided no category, just return the artist ID
                    IF ISNULL(givenCategoryName) THEN
                        SET MetaRowId = ArtistId;
                    ELSE 
                        SET MetaRowId = (
                            SELECT id
                            FROM meta
                            WHERE (
                                artist_id = ArtistId
                                AND category_name = givenCategoryName
                            )
                        );
                    END IF;
                ELSEIF CategoryId IS NOT NULL THEN
                    -- Same as above, category already exists and we werent given a new artist
                    IF ISNULL(givenArtistName) THEN
                        SET MetaRowId = CategoryId;
                    ELSE
                        SET MetaRowId = (
                            SELECT id
                            FROM meta
                            WHERE (
                                category_id = CategoryId
                                AND artist_name = givenArtistName
                            )
                        );
                    END IF;
                END IF;
            END IF;
            
            IF ISNULL(MetaRowId) THEN
                -- All custom values present, check for everything
                SET MetaRowId = (
                    SELECT id 
                    FROM meta 
                    WHERE 
                        artist_id <=> ArtistId
                        AND category_id <=> CategoryId
                        AND artist_name <=> ArtistName
                        AND category_name <=> CategoryName
                    LIMIT 1
                );
            END IF;
            
        END;
    DECLARE EXIT HANDLER FOR SQLSTATE 'ERROR'
        BEGIN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'An unhandled exception occured on `meta_row_insert`';
        END;
    
    -- Function invokation, retry after the above variables have been parsed
    IF CompleteFlag = 0 THEN
        SIGNAL SQLSTATE 'RETRY';
    END IF;

    -- No row has been found matching params, insert a new one and select (retry) again
    IF ISNULL(MetaRowId) THEN
        
        INSERT INTO 
            meta(
                artist_name, 
                artist_id, 
                category_name, 
                category_id
            )
        VALUES(
            ArtistName,
            ArtistId,
            CategoryName,
            CategoryId
        );
        SET CompleteFlag = 1;
        SIGNAL SQLSTATE 'RETRY';
    END IF;

    IF CompleteFlag != 0 AND ISNULL(MetaRowId) THEN
        /*
        If the function has run its course (meaning an insert statement was called), 
        then something went wrong and we either cannot query the row we just inserted, 
        OR there was an error when trying to insert it
        */
        SIGNAL SQLSTATE 'ERROR';
    END IF;

    RETURN (MetaRowId);
    
END//
DELIMITER ;

SELECT meta_row_insert(
    'lorem', NULL
);
SELECT meta_row_insert(
    NULL, 'domas'
);
SELECT meta_row_insert(
    'lorem', 'domas'
);
SELECT meta_row_insert(
    'lorem', 'domas'
);
SELECT meta_row_insert(
    'lorem', NULL
);
SELECT meta_row_insert(
    'milo', 'hello'
);
SELECT meta_row_insert(
    'lorem', 'hello'
);
SELECT meta_row_insert(
    'lorem', 'world'
);
SELECT meta_row_insert(
    'milo', 'world'
);