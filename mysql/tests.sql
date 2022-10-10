# https://stackoverflow.com/questions/7324845/chaining-sql-queries

## gets all items by ID relationship where the category = 'comedy' and has artist_id of 2
SELECT * FROM media 
WHERE media.id IN(
    SELECT media_id FROM media_relation 
    WHERE category_id IN(
        SELECT id from category WHERE name = 'comedy' 
    )
    AND artist_id = 2
);
