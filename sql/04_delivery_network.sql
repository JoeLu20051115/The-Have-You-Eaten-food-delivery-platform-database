USE smarteats;

CREATE TABLE rider (
    rider_id CHAR(5) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('available', 'busy', 'offline') NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    affiliation_type ENUM('full_time', 'part_time', 'outsourced') NOT NULL,
    PRIMARY KEY (rider_id),
    UNIQUE KEY uq_rider_phone (phone),
    KEY idx_rider_status (status),
    CONSTRAINT chk_rider_rating CHECK (rating BETWEEN 0 AND 5),
    CONSTRAINT chk_rider_phone_format CHECK (phone REGEXP '^[0-9]{11,20}$')
) ENGINE=InnoDB;

CREATE TABLE delivery_task (
    task_id CHAR(5) NOT NULL,
    order_id INT NULL,
    rider_id CHAR(5) NOT NULL,
    task_status ENUM('pending', 'assigned', 'picked_up', 'delivering', 'completed', 'cancelled') NOT NULL,
    PRIMARY KEY (task_id),
    UNIQUE KEY uq_delivery_task_order (order_id),
    KEY idx_delivery_task_rider_status (rider_id, task_status),
    CONSTRAINT fk_delivery_task_order
        FOREIGN KEY (order_id) REFERENCES orders (order_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_delivery_task_rider
        FOREIGN KEY (rider_id) REFERENCES rider (rider_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

LOAD DATA LOCAL INFILE 'data/delivery_network/rider.csv'
INTO TABLE rider
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(rider_id, real_name, phone, status, rating, affiliation_type);

LOAD DATA LOCAL INFILE 'data/delivery_network/delivery_task.csv'
INTO TABLE delivery_task
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(task_id, rider_id, task_status, @order_id)
SET order_id = NULLIF(@order_id, '');
