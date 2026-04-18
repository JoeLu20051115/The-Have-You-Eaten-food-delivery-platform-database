#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.txt"

if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
  echo "requirements.txt not found: $REQUIREMENTS_FILE" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update
mapfile -t packages < <(
  tr -d '\r' < "$REQUIREMENTS_FILE" |
  sed '1s/^\xEF\xBB\xBF//' |
  sed '/^\s*$/d' |
  sed '/^\s*#/d'
)

if [[ ${#packages[@]} -eq 0 ]]; then
  echo "No packages found in $REQUIREMENTS_FILE" >&2
  exit 1
fi

sudo apt-get install -y "${packages[@]}"

if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl enable mariadb || true
  sudo systemctl start mariadb || true
else
  sudo service mariadb start || true
fi

sudo mariadb -e "CREATE DATABASE IF NOT EXISTS smarteats;"

echo
echo "WSL database environment installation completed."
echo "Next step: run ./scripts/bootstrap_database.sh"
