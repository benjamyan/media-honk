DROP TABLE IF EXISTS sources;
CREATE TABLE sources (
    id INT unsigned NOT NULL,
    title TEXT NOT NULL,
    abs_url TEXT NOT NULL,
    entries_len INT NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `sources`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

DROP TABLE IF EXISTS bundles;
CREATE TABLE bundles (
    id INT unsigned NOT NULL,
    main_title TEXT NOT NULL,
    sub_title TEXT,
    rel_url TEXT NOT NULL,
    poster_img_uri TEXT,
    entries INT NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `bundles`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

DROP TABLE IF EXISTS media;
CREATE TABLE media (
    id INT unsigned NOT NULL,
    title TEXT NOT NULL,
    rel_url TEXT NOT NULL,
    cover_img_uri TEXT
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `media`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

DROP TABLE IF EXISTS meta;
CREATE TABLE meta (
    id INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
    artist_name TEXT,
    artist_id INT unsigned,
    category_name TEXT,
    category_id INT unsigned,
    FOREIGN KEY (artist_id) REFERENCES meta(id),
    FOREIGN KEY (category_id) REFERENCES meta(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
/* ALTER TABLE `meta`
CHANGE `id` `id` INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1; */

/* CREATE TABLE artists (
    id INT unsigned NOT NULL,
    name TEXT NOT NULL,
    source_id INT unsigned NOT NULL,
    FOREIGN KEY (source_id) REFERENCES source(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `artists`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1; */

/* CREATE TABLE categories (
    id INT unsigned NOT NULL,
    name TEXT,
    source_id INT unsigned NOT NULL,
    FOREIGN KEY (source_id) REFERENCES source(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `categories`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1; */

DROP TABLE IF EXISTS media_relationships;
CREATE TABLE media_relationships (
    source_id INT unsigned NOT NULL,
    bundle_id INT unsigned,
    media_id INT unsigned NOT NULL,
    meta_id INT unsigned,
    FOREIGN KEY (source_id) REFERENCES sources(id),
    FOREIGN KEY (bundle_id) REFERENCES bundles(id),
    FOREIGN KEY (media_id) REFERENCES media(id),
    FOREIGN KEY (meta_id) REFERENCES meta(id)
);
