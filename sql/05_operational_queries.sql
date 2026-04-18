USE smarteats;

-- 1. Customer order history with delivery progress
SELECT o.order_id,
       o.order_time,
       o.order_status,
       o.total_amount,
       dt.task_status,
       r.real_name AS rider_name
FROM orders AS o
LEFT JOIN delivery_task AS dt ON dt.order_id = o.order_id
LEFT JOIN rider AS r ON r.rider_id = dt.rider_id
WHERE o.customer_id = 'C001'
ORDER BY o.order_time DESC;

-- 2. Orders currently waiting for merchant preparation
SELECT s.store_name,
       o.order_id,
       o.order_time,
       o.payment_status,
       o.total_amount
FROM orders AS o
JOIN store AS s ON s.store_id = o.store_id
WHERE o.order_status IN ('Pending', 'Preparing')
ORDER BY o.order_time;

-- 3. Order line items for a specific order
SELECT od.detail_id,
       d.dish_name,
       od.quantity,
       od.discount,
       od.actual_price
FROM order_detail AS od
JOIN dish AS d ON d.dish_id = od.dish_id
WHERE od.order_id = 1
ORDER BY od.detail_id;

-- 4. Daily revenue by store
SELECT s.store_name,
       DATE(o.order_time) AS business_date,
       COUNT(*) AS order_count,
       ROUND(SUM(o.total_amount), 2) AS gross_revenue
FROM orders AS o
JOIN store AS s ON s.store_id = o.store_id
WHERE o.order_status = 'Completed'
GROUP BY s.store_name, DATE(o.order_time)
ORDER BY business_date, gross_revenue DESC;

-- 5. Rider workload dashboard
SELECT r.rider_id,
       r.real_name,
       r.status,
       COUNT(dt.task_id) AS total_tasks,
       SUM(dt.task_status = 'completed') AS completed_tasks,
       SUM(dt.task_status IN ('assigned', 'picked_up', 'delivering')) AS active_tasks
FROM rider AS r
LEFT JOIN delivery_task AS dt ON dt.rider_id = r.rider_id
GROUP BY r.rider_id, r.real_name, r.status
ORDER BY active_tasks DESC, completed_tasks DESC;

-- 6. Best-selling dishes
SELECT d.dish_name,
       s.store_name,
       SUM(od.quantity) AS units_sold,
       ROUND(SUM(od.actual_price), 2) AS realized_revenue
FROM order_detail AS od
JOIN dish AS d ON d.dish_id = od.dish_id
JOIN store AS s ON s.store_id = d.store_id
GROUP BY d.dish_id, d.dish_name, s.store_name
ORDER BY units_sold DESC, realized_revenue DESC
LIMIT 10;

-- 7. Customer address book
SELECT c.customer_id,
       c.user_name,
       a.address_id,
       a.contact_name,
       a.contact_phone,
       a.address_text
FROM customer AS c
JOIN address AS a ON a.customer_id = c.customer_id
ORDER BY c.customer_id, a.address_id;

-- 8. Merchant settlement summary
SELECT m.merchant_name,
       COUNT(*) AS completed_orders,
       ROUND(SUM(o.total_amount), 2) AS settled_gmv
FROM merchant AS m
JOIN store AS s ON s.merchant_id = m.merchant_id
JOIN orders AS o ON o.store_id = s.store_id
WHERE o.order_status = 'Completed'
  AND o.settlement_status = 'Settled'
GROUP BY m.merchant_id, m.merchant_name
ORDER BY settled_gmv DESC;
