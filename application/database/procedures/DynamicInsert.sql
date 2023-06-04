DROP PROCEDURE IF EXISTS dynamic_multi_insert;

DELIMITER //
CREATE PROCEDURE dynamic_multi_insert (
    IN mediaMeta TEXT,
    IN tableName TEXT,
    IN selectCol TEXT,
    IN alterCol TEXT,
    IN shouldOverwrite BOOLEAN
)
BEGIN
    SET @Meta = mediaMeta;
    SET @Exists = NULL;
    SET @Current = 's';
    
    SET @stmt_Select = CONCAT(
        'SELECT ', selectCol, ' INTO @Exists FROM ', tableName, ' WHERE ', alterCol, ' = @Current'
    );
    SET @stmt_Insert = CONCAT(
        'INSERT INTO ', tableName, ' (', alterCol, ') VALUES (@Current)'
    );
    SET @stmt_Update = CONCAT(
        'UPDATE ', tableName, ' SET ', alterCol, ' = @Current WHERE ', selectCol, ' = @Exists'
    );

    WHILE @Current != '' DO
        SET @Current = SUBSTRING_INDEX(@Meta, ',', 1);
        
        PREPARE stmt1 FROM @stmt_Select;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;
        
        IF @Exists IS NULL THEN
            PREPARE stmt2 FROM @stmt_Insert;
            EXECUTE stmt2;
            DEALLOCATE PREPARE stmt2;
        ELSE
            IF shouldOverwrite <=> 1 THEN
                PREPARE stmt3 FROM @stmt_Update;
                EXECUTE stmt3;
                DEALLOCATE PREPARE stmt3;
            END IF; 
            SET @Exists = NULL;
        END IF;

        IF LOCATE(',', @Meta) > 0 THEN
            SET @Meta = SUBSTRING(@Meta, LOCATE(',', @Meta) + 1);
        ELSE
            SET @Current = '';
        END IF;

    END WHILE;

END//
DELIMITER ;

/* CALL dynamic_multi_insert('comedy,action,violence,drama,poopoo', 'category', 'id', 'name', 1); */
