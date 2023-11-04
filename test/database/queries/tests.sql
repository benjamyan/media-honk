# https://stackoverflow.com/questions/7324845/chaining-sql-queries

## get a specific media item that has multiple distinct categories
SELECT * 
FROM media
WHERE media.id IN(
    SELECT media_id 
    FROM media_relation AS curr
    WHERE category_id IN(
        SELECT id FROM category WHERE name = 'action' 
    )
    AND EXISTS (
        SELECT media_id 
        FROM media_relation
        WHERE media_id = curr.media_id
        AND category_id IN(
            SELECT id FROM category WHERE name = 'comedy' 
        )
    )
)

SELECT * 
FROM media
WHERE media.id IN(
    SELECT media_id 
    FROM media_relation AS curr
    WHERE category_id = 3
    AND EXISTS (
        SELECT media_id 
        FROM media_relation
        WHERE media_id = curr.media_id
        AND category_id = 2
    )
);

SELECT *
FROM media
WHERE media.id IN(
    SELECT DISTINCT media_id 
    FROM media_relation AS Curr
    WHERE source_id = 1
    AND category_id = 1
    AND EXISTS (
        SELECT media_id 
        FROM media_relation
        WHERE media_id = Curr.media_id
        AND category_id = 3
    )
);
