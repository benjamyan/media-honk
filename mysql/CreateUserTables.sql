CREATE TABLE honkers (
    name VARCHAR(24) NOT NULL,
    # Hashed password
    pass VARCHAR(255) NOT NULL,
    date_created DATETIME NOT NULL
) CHARACTER SET utf16 COLLATE utf16_unicode_ci;
INSERT INTO honkers (name, pass, date_created) VALUES ('usertest', 'j4h5kj34h523j4n32jk4h32h42kj432j43jh23h43k28asd98un1j89cb2189bdsa', NOW());
