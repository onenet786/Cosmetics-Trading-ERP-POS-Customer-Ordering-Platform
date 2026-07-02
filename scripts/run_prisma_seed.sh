#!/usr/bin/env bash
# scripts/run_prisma_seed.sh - Run Prisma migrations and seed the silkglow_db database
# ---------------------------------------------------------------
# This script assumes you have a .env file at the project root with a
# DATABASE_URL that points to the `silkglow_db` PostgreSQL database.
# It will:
#   1. Generate the Prisma client
#   2. Apply any pending migrations (deploy mode for production)
#   3. Execute the seed script (prisma/seed.ts)

set -euo pipefail

# Verify .env exists
if [ ! -f .env ]; then
  echo ".env file not found at project root. Create it with DATABASE_URL first."
  exit 1
fi

# Generate Prisma client
npx prisma generate

# Apply migrations (use deploy for CI/CD / production)
# If you are running locally for the first time, you can use `dev`
# but `deploy` works without interactive prompts.
 npx prisma migrate deploy

# Run the seed script
node prisma/seed.ts
