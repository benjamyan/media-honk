-- https://www.aspsnippets.com/Articles/Use-Comma-Separated-Delimited-string-values-with-IN-and-WHERE-clause-in-SQL-Server.aspx

CREATE FUNCTION SplitString
(    
      @Input VARCHAR(MAX),
      @Character CHAR(1)
)
RETURNS @Output TABLE (
      Item VARCHAR(1000)
)
AS
BEGIN
      DECLARE @StartIndex INT, @EndIndex INT
 
      SET @StartIndex = 1
      IF SUBSTRING(@Input, LEN(@Input) - 1, LEN(@Input)) <> @Character
      BEGIN
            SET @Input = @Input + @Character
      END
 
      WHILE CHARINDEX(@Character, @Input) > 0
      BEGIN
            SET @EndIndex = CHARINDEX(@Character, @Input)
           
            INSERT INTO @Output(Item)
            SELECT SUBSTRING(@Input, @StartIndex, @EndIndex - 1)
           
            SET @Input = SUBSTRING(@Input, @EndIndex + 1, LEN(@Input))
      END
 
      RETURN
END
GO
