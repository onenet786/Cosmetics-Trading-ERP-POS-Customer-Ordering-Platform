#!/usr/bin/env bash
# scripts/run_prisma_migrate.sh - Run Prisma migrations using the DATABASE_URL from .env
# ---------------------------------------------------------------
# This script reads the DATABASE_URL defined in the project's .env file
# and passes it to the Prisma CLI, which is required for Prisma 7+
# because the datasource URL can no longer be declared in the schema.

set -euo pipefail

# Ensure .env exists
if [ ! -f .env ]; then
  echo ".env file not found. Create it with DATABASE_URL first."
  exit 1
fi

# Extract DATABASE_URL (ignore lines that are commented out)
DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | cut -d'=' -f2-)

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set in .env"
  exit 1
fi

# Run migration (you can change the migration name as needed)
# The --skip-generate flag skips client generation here (you can run generate separately)
 npx prisma migrate dev --name init --url "$DATABASE_URL" --skip-generate
