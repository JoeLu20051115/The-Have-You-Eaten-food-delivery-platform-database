#!/usr/bin/env bash
# Start user-space mysqld (background). Requires install_mariadb_no_sudo.sh first.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_ROOT="${MARIADB_STATE_ROOT:-$HOME/.local/share/smarteats-mariadb}"
if [[ -f "$STATE_ROOT/env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$STATE_ROOT/env.sh"
else
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/user_mariadb_env.sh"
fi

if [[ ! -x "$MARIADB_BASE/bin/mysqld" ]]; then
  echo "MariaDB not installed. Run: bash $SCRIPT_DIR/install_mariadb_no_sudo.sh" >&2
  exit 1
fi

MYSQLADMIN="$MARIADB_BASE/bin/mariadb-admin"
[[ -x "$MYSQLADMIN" ]] || MYSQLADMIN="$MARIADB_BASE/bin/mysqladmin"

if [[ -S "$MARIADB_SOCKET" ]]; then
  if "$MYSQLADMIN" ping -S "$MARIADB_SOCKET" --silent 2>/dev/null; then
    echo "MariaDB already running (socket $MARIADB_SOCKET)."
    exit 0
  fi
fi

echo "==> Starting mysqld (port $MARIADB_PORT, socket $MARIADB_SOCKET) …"
if [[ -x "$MARIADB_BASE/bin/mysqld_safe" ]]; then
  nohup "$MARIADB_BASE/bin/mysqld_safe" --defaults-file="$MARIADB_CONF" >/dev/null 2>&1 &
else
  nohup "$MARIADB_BASE/bin/mysqld" --defaults-file="$MARIADB_CONF" >/dev/null 2>&1 &
fi
echo $! >"$MARIADB_STATE_ROOT/mysqld_safe.pid"

for _ in $(seq 1 45); do
  if "$MYSQLADMIN" ping -S "$MARIADB_SOCKET" --silent 2>/dev/null; then
    echo "MariaDB is up."
    exit 0
  fi
  sleep 1
done

echo "MariaDB did not become ready in time. Check $MARIADB_DATADIR/*.err" >&2
exit 1
