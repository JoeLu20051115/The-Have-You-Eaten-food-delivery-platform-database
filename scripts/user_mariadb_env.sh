#!/usr/bin/env bash
# Shared defaults for user-space MariaDB (no sudo). Override before sourcing if needed.
export MARIADB_VERSION="${MARIADB_VERSION:-10.11.11}"
export MARIADB_INSTALL_ROOT="${MARIADB_INSTALL_ROOT:-$HOME/.local/opt}"
export MARIADB_STATE_ROOT="${MARIADB_STATE_ROOT:-$HOME/.local/share/smarteats-mariadb}"
export MARIADB_ARCH="${MARIADB_ARCH:-x86_64}"
export MARIADB_PORT="${MARIADB_PORT:-3307}"

MARIADB_NAME="mariadb-${MARIADB_VERSION}-linux-systemd-${MARIADB_ARCH}"
export MARIADB_BASE="${MARIADB_INSTALL_ROOT}/${MARIADB_NAME}"
export MARIADB_DATADIR="${MARIADB_STATE_ROOT}/data"
export MARIADB_SOCKET="${MARIADB_SOCKET:-${MARIADB_STATE_ROOT}/mysql.sock}"
export MARIADB_CONF="${MARIADB_STATE_ROOT}/my.cnf"
export MARIADB_TARBALL="${MARIADB_STATE_ROOT}/${MARIADB_NAME}.tar.gz"
export MARIADB_DOWNLOAD_URL="https://archive.mariadb.org/mariadb-${MARIADB_VERSION}/bintar-linux-systemd-${MARIADB_ARCH}/${MARIADB_NAME}.tar.gz"
# Official archive file size for 10.11.11 linux-systemd x86_64 (skip re-download if local file matches).
export MARIADB_TARBALL_EXPECTED_BYTES="${MARIADB_TARBALL_EXPECTED_BYTES:-348364551}"
