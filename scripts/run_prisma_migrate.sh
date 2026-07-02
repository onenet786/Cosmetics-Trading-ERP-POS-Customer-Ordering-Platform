#!/usr/bin/env bash
# scripts/run_prisma_migrate.sh - Run Prisma migrations
# ---------------------------------------------------------------

set -euo pipefail

# Ensure .env exists
if [ ! -f .env ]; then
  echo ".env file not found. Create it with DATABASE_URL first."
  exit 1
fi

npx prisma migrate dev --name init
