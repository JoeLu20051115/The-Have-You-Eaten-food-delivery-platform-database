#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

sudo mariadb --local-infile=1 <<'SQL'
SOURCE sql/00_initialize_database.sql;
USE smarteats;
SHOW TABLES;
SQL
