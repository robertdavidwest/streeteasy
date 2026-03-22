#!/bin/bash
# Production database migration script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to backend directory
cd "$(dirname "$0")"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo "Please create .env.production with your RAILWAY_DATABASE_URL"
    exit 1
fi

# Load production environment variables
source .env.production

# Check if RAILWAY_DATABASE_URL is set
if [ -z "$RAILWAY_DATABASE_URL" ]; then
    echo -e "${RED}❌ RAILWAY_DATABASE_URL not set in .env.production${NC}"
    echo "Please add your Railway database URL to .env.production"
    exit 1
fi

# Check if it's still the placeholder value
if [[ "$RAILWAY_DATABASE_URL" == *"user:password"* ]]; then
    echo -e "${RED}❌ RAILWAY_DATABASE_URL still has placeholder values${NC}"
    echo "Please update .env.production with your actual Railway database URL"
    exit 1
fi

echo -e "${YELLOW}🚀 Running production migrations...${NC}"
echo "Database: ${RAILWAY_DATABASE_URL:0:30}..."
echo ""

# Show current migration status
echo -e "${YELLOW}Current migration status:${NC}"
DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic current

echo ""
echo -e "${YELLOW}Applying migrations:${NC}"

# Run migrations
DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic upgrade head

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Production migrations completed successfully!${NC}"

    # Show new status
    echo ""
    echo -e "${GREEN}New migration status:${NC}"
    DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic current
else
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi