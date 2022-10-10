# media items
INSERT INTO media (main_title, asset_path, entries) 
VALUES ('Die Hard', 'example', 1); #1
INSERT INTO media (main_title, sub_title, asset_path, entries) 
VALUES ('Futurama', 'Season 1', 'futurama/season1', 2); #2
INSERT INTO media (main_title, sub_title, asset_path, entries) 
VALUES ('Futurama', 'Season 2', 'futurama/season2', 2); #3
INSERT INTO media (main_title, asset_path, entries) 
VALUES ('Tucker and Dale vs Evil', 'title', 1); #4

# categories
INSERT INTO category (name) VALUES ('action'); #1
INSERT INTO category (name) VALUES ('adventure'); #2
INSERT INTO category (name) VALUES ('comedy'); #3
INSERT INTO category (name) VALUES ('drama'); #4

# artists
INSERT INTO artist (name) VALUES ('Bruce Willis'); #1
INSERT INTO artist (name) VALUES ('Tucker Bojangles'); #2
INSERT INTO artist (name) VALUES ('Dale Sale'); #3

# sources
INSERT INTO source (title, asset_path) 
VALUES ('Movies', '/path/to/movies'); #1
INSERT INTO source (title, asset_path)
VALUES ('TV Series', '/path/to/tvshows'); #2

## baseline relationships
# die hard
INSERT INTO media_relation (media_id, artist_id, category_id, source_id) 
VALUES (1, 1, 1, 1);
INSERT INTO media_relation (media_id, artist_id, category_id, source_id) 
VALUES (1, 1, 4, 1);
# futurama s1
INSERT INTO media_relation (media_id, category_id, source_id) 
VALUES (2, 2, 2);
INSERT INTO media_relation (media_id, category_id, source_id) 
VALUES (2, 3, 2);
INSERT INTO media_relation (media_id, category_id, source_id) 
VALUES (2, 4, 2);
# futurama s2
INSERT INTO media_relation (media_id, category_id, source_id) 
VALUES (3, 2, 2);
INSERT INTO media_relation (media_id, category_id, source_id) 
VALUES (3, 3, 2);
INSERT INTO media_relation (media_id, category_id, source_id) 
VALUES (3, 4, 2);
# tucker and dale
INSERT INTO media_relation (media_id, artist_id, category_id, source_id) 
VALUES (4, 2, 3, 1);
INSERT INTO media_relation (media_id, artist_id, category_id, source_id) 
VALUES (4, 3, 1, 1);
