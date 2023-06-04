WITH RECURSIVE
    curr_meta(x) AS (
        SELECT id FROM meta WHERE artist_name = 'Barren Earth'
    )
SELECT * FROM curr_meta;


WITH RECURSIVE
    curr_meta(x) AS (
        SELECT id FROM meta WHERE artist_name = 'Barren Earth'
    )
SELECT * FROM meta WHERE meta.id IN curr_meta OR meta.artist_id IN curr_meta;

WITH RECURSIVE
    curr_meta(x) AS (
        SELECT id FROM meta WHERE artist_name = 'Barren Earth'
    ),
    relevent(y) AS (
        SELECT id FROM meta WHERE id IN curr_meta OR artist_id IN curr_meta OR category_id IN curr_meta
    )
SELECT * FROM meta WHERE id IN relevent OR id IN curr_meta;

WITH RECURSIVE
    curr_meta(x) AS (
        SELECT id FROM meta WHERE artist_name = 'Barren Earth'
    ),
    relevent(y) AS (
        SELECT id FROM meta WHERE id IN curr_meta OR artist_id IN curr_meta OR category_id IN curr_meta
    ),
    total(z) AS (
        SELECT category_id FROM meta WHERE id IN relevent
    )
SELECT * FROM meta WHERE id IN relevent OR id IN total;
