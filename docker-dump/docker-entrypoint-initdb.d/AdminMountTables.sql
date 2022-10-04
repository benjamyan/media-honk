CREATE TABLE artists (
    artist_id int,
    artist_name varchar(200)
);
CREATE TABLE media (
    media_id int,
    media_title varchar(255),
    media_artist varchar(100),
    media_category varchar(100),
    media_length smallint,
    asset_parth text,
    cover_path text
);
CREATE TABLE honkers (
    honker_id int,
    honker_name varchar(24),
    honker_pass varchar(24),
    honker_date_created date

);