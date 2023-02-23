
INSERT INTO sources (id, title, abs_url) VALUES (1, 'test-title', 'test-abs_url');
INSERT INTO covers (id, file_url, source_id) VALUES (1, 'test-file_url', 1);
INSERT INTO media (id, title, filename, rel_url, rel_url_id, cover_img_id, source_id) VALUES (1, 'test-media-title', 'test-filename', 'test-rel_url', 1, 1, 1);
INSERT INTO bundles (id, main_title, sub_title, cover_img_id) VALUES (1, 'test-main_title', 'test-sub_title', 1);
INSERT INTO meta (artist_name, category_name) VALUES ('test-artist_name', 'test-category_name');
INSERT INTO meta (artist_id, category_name) VALUES (1, 'test-category_name');
INSERT INTO meta (artist_name, category_id) VALUES ('test-artist_name', 2);
INSERT INTO media_meta (media_id, meta_id) VALUES (1, 1);
INSERT INTO bundle_media (media_id, media_index) VALUES (1, 1);