DROP TABLE IF EXISTS media_relationships;
DROP TABLE IF EXISTS meta;
DROP TABLE IF EXISTS bundles;
DROP TABLE IF EXISTS media;
/* DROP TABLE IF EXISTS sources; */

CREATE TABLE sources (
    id INT unsigned NOT NULL,
    title TEXT NOT NULL,
    abs_url TEXT NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `sources`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE media (
    id INT unsigned NOT NULL,
    name TEXT NOT NULL,
    rel_url TEXT NOT NULL,
    cover_img_uri TEXT,
    source_id INT unsigned NOT NULL,
    FOREIGN KEY (source_id) REFERENCES sources(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `media`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE bundles (
    id INT unsigned NOT NULL,
    main_title TEXT NOT NULL,
    sub_title TEXT,
    cover_img_id INT unsigned,
    FOREIGN KEY (cover_img_id) REFERENCES media(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `bundles`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE meta (
    id INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
    artist_name TEXT,
    artist_id INT unsigned,
    category_name TEXT,
    category_id INT unsigned,
    FOREIGN KEY (artist_id) REFERENCES meta(id),
    FOREIGN KEY (category_id) REFERENCES meta(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;

CREATE TABLE media_relationships (
    bundle_id INT unsigned,
    meta_id INT unsigned,
    media_id INT unsigned NOT NULL,
    media_index INT,
    FOREIGN KEY (bundle_id) REFERENCES bundles(id),
    FOREIGN KEY (media_id) REFERENCES media(id),
    FOREIGN KEY (meta_id) REFERENCES meta(id)
);
