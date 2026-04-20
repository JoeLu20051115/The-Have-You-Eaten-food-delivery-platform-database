-- Application login for FastAPI (pymysql uses TCP to 127.0.0.1 by default).
-- Run as MariaDB/MySQL admin after smarteats schema exists (e.g. via bootstrap_database.sh).

USE smarteats;

CREATE USER IF NOT EXISTS 'smarteats_app'@'127.0.0.1' IDENTIFIED BY 'SmartEats3170App123';
CREATE USER IF NOT EXISTS 'smarteats_app'@'localhost' IDENTIFIED BY 'SmartEats3170App123';

GRANT SELECT, INSERT, UPDATE, DELETE ON smarteats.* TO 'smarteats_app'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE ON smarteats.* TO 'smarteats_app'@'localhost';

FLUSH PRIVILEGES;
