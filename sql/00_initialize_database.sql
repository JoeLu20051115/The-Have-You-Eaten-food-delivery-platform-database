-- SmartEats Food Delivery Platform
-- Master setup script
-- Run from the project root inside the MySQL client:
-- SOURCE sql/00_initialize_database.sql;

DROP DATABASE IF EXISTS smarteats;
CREATE DATABASE smarteats
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE smarteats;

SOURCE sql/01_consumer_side.sql;
SOURCE sql/02_merchant_and_menu.sql;
SOURCE sql/03_order_hub.sql;
SOURCE sql/04_delivery_network.sql;
