USE smarteats;

CREATE TABLE merchant (
    merchant_id INT NOT NULL,
    merchant_name VARCHAR(100) NOT NULL,
    license_no VARCHAR(100) NOT NULL,
    PRIMARY KEY (merchant_id),
    UNIQUE KEY uq_merchant_license_no (license_no)
) ENGINE=InnoDB;

CREATE TABLE store (
    store_id INT NOT NULL,
    merchant_id INT NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    min_order_amount DECIMAL(10,2) NOT NULL,
    avg_prep_minutes INT NOT NULL,
    PRIMARY KEY (store_id),
    KEY idx_store_merchant (merchant_id),
    CONSTRAINT fk_store_merchant
        FOREIGN KEY (merchant_id) REFERENCES merchant (merchant_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_store_min_order_amount CHECK (min_order_amount >= 0),
    CONSTRAINT chk_store_avg_prep_minutes CHECK (avg_prep_minutes BETWEEN 5 AND 120)
) ENGINE=InnoDB;

CREATE TABLE category (
    category_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (category_id),
    UNIQUE KEY uq_category_name (category_name)
) ENGINE=InnoDB;

CREATE TABLE dish (
    dish_id INT NOT NULL,
    store_id INT NOT NULL,
    category_id INT NOT NULL,
    dish_name VARCHAR(150) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (dish_id),
    KEY idx_dish_store (store_id),
    KEY idx_dish_category (category_id),
    KEY idx_dish_store_category (store_id, category_id),
    CONSTRAINT fk_dish_store
        FOREIGN KEY (store_id) REFERENCES store (store_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_dish_category
        FOREIGN KEY (category_id) REFERENCES category (category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_dish_base_price CHECK (base_price > 0)
) ENGINE=InnoDB;

LOAD DATA LOCAL INFILE 'data/merchant_and_menu/merchant.csv'
INTO TABLE merchant
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(merchant_id, merchant_name, license_no);

LOAD DATA LOCAL INFILE 'data/merchant_and_menu/store.csv'
INTO TABLE store
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(store_id, store_name, min_order_amount, avg_prep_minutes, merchant_id);

LOAD DATA LOCAL INFILE 'data/merchant_and_menu/category.csv'
INTO TABLE category
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(category_id, category_name);

LOAD DATA LOCAL INFILE 'data/merchant_and_menu/dish.csv'
INTO TABLE dish
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(dish_id, dish_name, base_price, store_id, category_id);
