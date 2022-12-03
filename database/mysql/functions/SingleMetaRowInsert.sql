DROP FUNCTION IF EXISTS single_meta_row_insert;
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
CREATE FUNCTION single_meta_row_insert(
    metaArtist TEXT,
    metaCategory TEXT
) 
RETURNS INT
DETERMINISTIC
BEGIN

    CREATE TEMPORARY TABLE IF NOT EXISTS meta_row LIKE meta;
    
    INSERT INTO 
        meta_row
    SET
        artist_id = IF(
            metaArtist is NOT NULL,
                (
                    SELECT meta.id FROM meta WHERE meta.artist_name = metaArtist
                ),
                NULL
        ),
        category_id = IF(
            metaCategory IS NOT NULL,
                (
                    SELECT meta.id FROM meta WHERE meta.category_name = metaCategory
                ),
                NULL
        ),
        artist_name = IF(artist_id IS NOT NULL, NULL, metaArtist),
        category_name = IF(category_id IS NOT NULL, NULL, metaCategory);
        
    INSERT INTO 
        meta(artist_name, artist_id, category_name, category_id)
    SELECT
        artist_name,
        artist_id,
        category_name,
        category_id
    FROM
        meta_row
    WHERE 
        meta_row.id = LAST_INSERT_ID()
        AND (
            meta_row.artist_name IS NOT NULL 
            OR meta_row.category_name IS NOT NULL
        );
    SET @NewMetaRowId = LAST_INSERT_ID();
        
    DROP TEMPORARY TABLE meta_row;
        
    RETURN (@NewMetaRowId);

END//
DELIMITER ;

/* SELECT single_meta_row_insert(
    'lorem',
    'domas'
); */
