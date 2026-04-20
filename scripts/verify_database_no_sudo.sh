#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_ROOT="${MARIADB_STATE_ROOT:-$HOME/.local/share/smarteats-mariadb}"
if [[ -f "$STATE_ROOT/env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$STATE_ROOT/env.sh"
else
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/user_mariadb_env.sh"
fi

MARIADB_CLI="$MARIADB_BASE/bin/mariadb"
[[ -x "$MARIADB_CLI" ]] || MARIADB_CLI="$MARIADB_BASE/bin/mysql"

cd "$PROJECT_ROOT"

"$MARIADB_CLI" -S "$MARIADB_SOCKET" -u root --local-infile=1 <<'SQL'
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
