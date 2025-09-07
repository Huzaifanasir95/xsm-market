#!/bin/bash

# Load DB credentials from .env

# Use backend .env file directly
ENV_FILE="/Users/Apple/Documents/GitHub/xsm-market/php-backend/.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo ".env file not found!"
  exit 1
fi

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-xsm_market_local}
SCHEMA_FILE="../database_schema_complete.sql"


# Drop all tables only if any exist
TABLES=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -Nse "SELECT GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema = '$DB_NAME';")
if [ -n "$TABLES" ]; then
  echo "Dropping tables: $TABLES"
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS $TABLES; SET FOREIGN_KEY_CHECKS = 1;"
else
  echo "No tables to drop."
fi

# Import schema
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SCHEMA_FILE"

echo "✅ Database reset and schema imported successfully."
