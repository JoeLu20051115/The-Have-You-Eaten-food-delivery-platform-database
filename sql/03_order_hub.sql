USE smarteats;

CREATE TABLE orders (
    order_id INT NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    address_id INT NOT NULL,
    store_id INT NOT NULL,
    order_time DATETIME NOT NULL,
    order_status ENUM('Pending', 'Preparing', 'Completed', 'Cancelled') NOT NULL,
    payment_method ENUM('Cash', 'Card', 'Wallet') NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Refunded') NOT NULL,
    review_score TINYINT UNSIGNED NULL,
    refund_status VARCHAR(30) NOT NULL,
    settlement_status ENUM('Unsettled', 'Settled') NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id),
    KEY idx_orders_customer_time (customer_id, order_time),
    KEY idx_orders_store_status (store_id, order_status),
    KEY idx_orders_payment_status (payment_status, settlement_status),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_orders_customer_address
        FOREIGN KEY (customer_id, address_id) REFERENCES address (customer_id, address_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_orders_store
        FOREIGN KEY (store_id) REFERENCES store (store_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_orders_review_score CHECK (review_score IS NULL OR review_score BETWEEN 1 AND 5),
    CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE order_detail (
    detail_id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    actual_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (detail_id),
    UNIQUE KEY uq_order_detail_order_dish (order_id, dish_id),
    KEY idx_order_detail_order (order_id),
    KEY idx_order_detail_dish (dish_id),
    CONSTRAINT fk_order_detail_order
        FOREIGN KEY (order_id) REFERENCES orders (order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_detail_dish
        FOREIGN KEY (dish_id) REFERENCES dish (dish_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_order_detail_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_detail_discount CHECK (discount >= 0),
    CONSTRAINT chk_order_detail_actual_price CHECK (actual_price >= 0)
) ENGINE=InnoDB;

LOAD DATA LOCAL INFILE 'data/order_hub/orders.csv'
INTO TABLE orders
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(order_id, customer_id, address_id, store_id, @order_time, order_status, payment_method, payment_status, @review_score, refund_status, settlement_status, total_amount)
SET order_time = STR_TO_DATE(@order_time, '%Y-%m-%d %H:%i:%s'),
    review_score = NULLIF(@review_score, '');

LOAD DATA LOCAL INFILE 'data/order_hub/order_details.csv'
INTO TABLE order_detail
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(order_id, dish_id, quantity, discount, actual_price);
