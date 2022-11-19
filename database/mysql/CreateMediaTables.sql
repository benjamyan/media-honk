CREATE TABLE media (
    id INT unsigned NOT NULL,
    main_title TEXT NOT NULL,
    sub_title TEXT,
    rel_path TEXT NOT NULL,
    cover_img TEXT,
    entries JSON NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `media`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE source (
    id INT unsigned NOT NULL,
    title TEXT NOT NULL,
    abs_path TEXT NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `source`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE artist (
    id INT unsigned NOT NULL,
    name TEXT NOT NULL,
    source_id INT unsigned NOT NULL,
    FOREIGN KEY (source_id) REFERENCES source(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `artist`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE category (
    id INT unsigned NOT NULL,
    name TEXT,
    source_id INT unsigned NOT NULL,
    FOREIGN KEY (source_id) REFERENCES source(id)
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
ALTER TABLE `category`
CHANGE `id` `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
AUTO_INCREMENT=1;

CREATE TABLE media_relation (
    media_id INT unsigned NOT NULL,
    artist_id INT unsigned,
    category_id INT unsigned,
    source_id INT unsigned NOT NULL,
    FOREIGN KEY (media_id) REFERENCES media(id),
    FOREIGN KEY (artist_id) REFERENCES artist(id),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (source_id) REFERENCES source(id)
);
