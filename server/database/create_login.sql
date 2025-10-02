USE master;
GO
-- Create the login at the server level if it doesn't exist
IF SUSER_ID('uteUser') IS NULL
BEGIN
    CREATE LOGIN uteUser WITH PASSWORD = 'StrongPassword123!';
END
GO

USE uteLMS;
GO
-- Create a user within the uteLMS database and map it to the login
IF USER_ID('uteUser') IS NULL
BEGIN
    CREATE USER uteUser FOR LOGIN uteUser;
END
GO

-- Grant roles for reading, writing, and schema modification to the user
-- These permissions are scoped to the uteLMS database only.
ALTER ROLE db_datareader ADD MEMBER uteUser;
ALTER ROLE db_datawriter ADD MEMBER uteUser;
ALTER ROLE db_ddladmin ADD MEMBER uteUser;
GO
