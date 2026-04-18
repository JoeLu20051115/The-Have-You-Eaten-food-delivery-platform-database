USE smarteats;

-- 1. Category revenue contribution by merchant
SELECT m.merchant_name,
       c.category_name,
       ROUND(SUM(od.actual_price), 2) AS category_revenue,
       ROUND(
           SUM(od.actual_price) / NULLIF(SUM(SUM(od.actual_price)) OVER (PARTITION BY m.merchant_id), 0),
           4
       ) AS revenue_share
FROM merchant AS m
JOIN store AS s ON s.merchant_id = m.merchant_id
JOIN dish AS d ON d.store_id = s.store_id
JOIN category AS c ON c.category_id = d.category_id
JOIN order_detail AS od ON od.dish_id = d.dish_id
GROUP BY m.merchant_id, m.merchant_name, c.category_id, c.category_name
ORDER BY m.merchant_name, category_revenue DESC;

-- 2. Hourly demand heatmap by store
SELECT s.store_name,
       HOUR(o.order_time) AS order_hour,
       COUNT(*) AS order_count,
       ROUND(AVG(o.total_amount), 2) AS avg_ticket_size
FROM orders AS o
JOIN store AS s ON s.store_id = o.store_id
GROUP BY s.store_id, s.store_name, HOUR(o.order_time)
ORDER BY s.store_name, order_hour;

-- 3. Rider performance ranking
SELECT r.rider_id,
       r.real_name,
       r.rating,
       COUNT(dt.task_id) AS total_tasks,
       SUM(dt.task_status = 'completed') AS completed_tasks,
       DENSE_RANK() OVER (
           ORDER BY SUM(dt.task_status = 'completed') DESC, r.rating DESC
       ) AS performance_rank
FROM rider AS r
LEFT JOIN delivery_task AS dt ON dt.rider_id = r.rider_id
GROUP BY r.rider_id, r.real_name, r.rating
ORDER BY performance_rank, r.rider_id;

-- 4. Customer lifetime value segmentation
SELECT o.customer_id,
       c.user_name,
       COUNT(*) AS total_orders,
       ROUND(SUM(o.total_amount), 2) AS lifetime_value,
       ROUND(AVG(o.review_score), 2) AS avg_review_score,
       NTILE(4) OVER (ORDER BY SUM(o.total_amount) DESC) AS value_quartile
FROM orders AS o
JOIN customer AS c ON c.customer_id = o.customer_id
GROUP BY o.customer_id, c.user_name
ORDER BY lifetime_value DESC;

-- 5. Frequently co-purchased dish pairs
SELECT d1.dish_name AS dish_a,
       d2.dish_name AS dish_b,
       COUNT(*) AS co_purchase_count
FROM order_detail AS od1
JOIN order_detail AS od2
  ON od1.order_id = od2.order_id
 AND od1.dish_id < od2.dish_id
JOIN dish AS d1 ON d1.dish_id = od1.dish_id
JOIN dish AS d2 ON d2.dish_id = od2.dish_id
GROUP BY d1.dish_id, d1.dish_name, d2.dish_id, d2.dish_name
HAVING COUNT(*) >= 2
ORDER BY co_purchase_count DESC, dish_a, dish_b;
