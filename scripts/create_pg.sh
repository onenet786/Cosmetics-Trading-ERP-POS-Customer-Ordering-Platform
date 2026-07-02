#!/usr/bin/env bash
# create_pg.sh - Create PostgreSQL role, database, and schema for the ERP project
# ---------------------------------------------------------------
# Edit the variables below with your desired credentials before running.

DB_ROLE="erp_user"
DB_PASSWORD="StrongPassword123"
DB_NAME="silkglow_db"
SCHEMA_FILE="erp_schema.sql"   # Path relative to the project root

# Create role
psql -v ON_ERROR_STOP=1 <<EOSQL
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_ROLE') THEN
      CREATE ROLE $DB_ROLE WITH LOGIN PASSWORD '$DB_PASSWORD';
   END IF;
END$$;
EOSQL

# Create database owned by the role
psql -v ON_ERROR_STOP=1 <<EOSQL
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
      CREATE DATABASE $DB_NAME OWNER $DB_ROLE;
   END IF;
END$$;
EOSQL

# Apply schema
psql -v ON_ERROR_STOP=1 -U $DB_ROLE -d $DB_NAME -f $SCHEMA_FILE

echo "✅ PostgreSQL role, database, and schema have been created."
