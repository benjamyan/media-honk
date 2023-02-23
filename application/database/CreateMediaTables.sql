DROP TABLE IF EXISTS media_relationships;
DROP TABLE IF EXISTS meta;
DROP TABLE IF EXISTS bundles;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS sources;

CREATE TABLE sources (
    id INTEGER NOT NULL,
    title TEXT NOT NULL,
    abs_url TEXT NOT NULL
);

CREATE TABLE covers (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    file_url TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE TABLE media (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    rel_url TEXT,
    rel_url_id INTEGER NOT NULL,
    cover_img_id INTEGER NOT NULL,
    source_id INTEGER NOT NULL,
    FOREIGN KEY (rel_url_id) REFERENCES media(id),
    FOREIGN KEY (cover_img_id) REFERENCES covers(id),
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE TABLE bundles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    main_title TEXT NOT NULL,
    sub_title TEXT,
    cover_img_id INTEGER NOT NULL,
    FOREIGN KEY (cover_img_id) REFERENCES media(id)
);

CREATE TABLE meta (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT,
    artist_id INTEGER,
    category_name TEXT,
    category_id INTEGER,
    FOREIGN KEY (artist_id) REFERENCES meta(id),
    FOREIGN KEY (category_id) REFERENCES meta(id)
);

CREATE TABLE media_meta (
    media_id INTEGER NOT NULL,
    meta_id INTEGER NOT NULL,
    FOREIGN KEY (media_id) REFERENCES media(id),
    FOREIGN KEY (meta_id) REFERENCES meta(id)
);
CREATE UNIQUE INDEX media_id ON media_meta(media_id);
CREATE UNIQUE INDEX meta_id ON media_meta(meta_id);

CREATE TABLE bundle_media (
    bundle_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER NOT NULL,
    media_index INTEGER,
    FOREIGN KEY (bundle_id) REFERENCES bundles(id),
    FOREIGN KEY (media_id) REFERENCES media(id)
);
/* CREATE UNIQUE INDEX media_id ON bundle_media(media_id); */
CREATE UNIQUE INDEX media_index ON bundle_media(media_index);
