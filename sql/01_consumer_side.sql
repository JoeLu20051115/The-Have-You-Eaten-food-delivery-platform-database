USE smarteats;

CREATE TABLE customer (
    customer_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    password_hash CHAR(64) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    PRIMARY KEY (customer_id),
    UNIQUE KEY uq_customer_phone (phone),
    CONSTRAINT chk_customer_phone_format CHECK (phone REGEXP '^[0-9]{11,20}$')
) ENGINE=InnoDB;

CREATE TABLE address (
    address_id INT NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (customer_id, address_id),
    UNIQUE KEY uq_address_id (address_id),
    KEY idx_address_customer (customer_id),
    CONSTRAINT fk_address_customer
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_address_phone_format CHECK (contact_phone REGEXP '^[0-9]{11,20}$')
) ENGINE=InnoDB;

LOAD DATA LOCAL INFILE 'data/consumer_side/customer.csv'
INTO TABLE customer
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(customer_id, user_name, phone, password_hash);

LOAD DATA LOCAL INFILE 'data/consumer_side/address.csv'
INTO TABLE address
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(address_id, customer_id, contact_name, contact_phone, address_text);
