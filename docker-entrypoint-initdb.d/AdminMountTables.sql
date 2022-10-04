CREATE TABLE honkers (
    _id INT unsigned,
    name VARCHAR(24),
    pass VARCHAR(24),
    date_created DATE
);

CREATE TABLE categories (
    _id INT unsigned,
    category VARCHAR(255)
        CHARACTER SET utf16
        COLLATE utf16_unicode_ci
);
CREATE TABLE media_categories (
    media_id INT unsigned,
    category INT unsigned
);

CREATE TABLE artists (
    _id INT unsigned,
    name VARCHAR(255)
        CHARACTER SET utf16
        COLLATE utf16_unicode_ci
);
CREATE TABLE media_artists (
    media_id INT unsigned,
    artist INT unsigned
);

CREATE TABLE sources (
    _id INT unsigned,
    name VARCHAR(64),
    type VARCHAR(64),
    absolute_path TEXT
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
CREATE TABLE media_source (
    media_id INT unsigned,
    source TEXT
);

CREATE TABLE media (
    _id INT unsigned,
    title TEXT
        CHARACTER SET utf16 
        COLLATE utf16_unicode_ci,
    asset_length SMALLINT,
    media_source VARCHAR(2)
);
