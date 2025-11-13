#!/bin/bash
# Simple TCP connection check for MySQL
timeout 1 bash -c "cat < /dev/null > /dev/tcp/${DATABASE_HOST:-db}/${DATABASE_PORT:-3306}" 2>/dev/null

