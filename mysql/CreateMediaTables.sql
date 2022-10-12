CREATE TABLE media (
    id INT unsigned NOT NULL,
    main_title TEXT NOT NULL,
    sub_title TEXT,
    asset_path TEXT NOT NULL,
    entries INT unsigned NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `media`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE source (
    id INT unsigned NOT NULL,
    title TEXT,
    asset_path TEXT
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `source`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE artist (
    id INT unsigned NOT NULL,
    name TEXT
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `artist`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE category (
    id INT unsigned NOT NULL,
    name TEXT
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `category`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE media_relation (
    media_id INT unsigned NOT NULL,
    artist_id INT unsigned,
    category_id INT unsigned,
    source_id INT unsigned,
    FOREIGN KEY (media_id) REFERENCES media(id),
    FOREIGN KEY (artist_id) REFERENCES artist(id),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (source_id) REFERENCES source(id)
);
