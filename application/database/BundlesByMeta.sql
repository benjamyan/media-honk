WITH RECURSIVE
    metaRows(x) AS (
        SELECT * FROM meta WHERE artist_name = x
    ),
    mediaRows(x) AS (
        SELECT * FROM media WHERE id = x
    ),
    mediaMetaRowByMediaId(x) AS (
        SELECT * FROM media_meta WHERE media_id = x
    ),
    mediaMetaRowById(x) AS (
        SELECT * FROM media_meta WHERE id = x
    ),
    bundleByMediaId(x) AS (
        SELECT * FROM bundles WHERE media_id = x
    )
SELECT *
FROM bundles
WHERE 