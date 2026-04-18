#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

sudo mariadb --local-infile=1 <<'SQL'
USE smarteats;

SELECT 'customer' AS table_name, COUNT(*) AS row_count FROM customer
UNION ALL
SELECT 'address', COUNT(*) FROM address
UNION ALL
SELECT 'merchant', COUNT(*) FROM merchant
UNION ALL
SELECT 'store', COUNT(*) FROM store
UNION ALL
SELECT 'category', COUNT(*) FROM category
UNION ALL
SELECT 'dish', COUNT(*) FROM dish
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_detail', COUNT(*) FROM order_detail
UNION ALL
SELECT 'rider', COUNT(*) FROM rider
UNION ALL
SELECT 'delivery_task', COUNT(*) FROM delivery_task;

SELECT COUNT(*) AS invalid_customer_address_links
FROM orders AS o
LEFT JOIN address AS a
  ON o.customer_id = a.customer_id
 AND o.address_id = a.address_id
WHERE a.address_id IS NULL;

SELECT COUNT(*) AS invalid_delivery_links
FROM delivery_task AS dt
LEFT JOIN orders AS o
  ON dt.order_id = o.order_id
WHERE dt.order_id IS NOT NULL
  AND o.order_id IS NULL;
SQL
