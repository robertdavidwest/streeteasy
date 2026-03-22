#!/bin/bash
# Check production database migration status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    exit 1
fi

echo -e "${BLUE}🔍 Checking production migration status...${NC}"
echo "Database: ${RAILWAY_DATABASE_URL:0:30}..."
echo ""

# Show current migration
echo -e "${YELLOW}Current migration:${NC}"
DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic current

echo ""
echo -e "${YELLOW}Migration history:${NC}"
DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic history --verbose

# Check if there are pending migrations
echo ""
echo -e "${YELLOW}Checking for pending migrations...${NC}"
CURRENT=$(DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic current 2>/dev/null | grep -o "[a-f0-9]\{12\}" | head -1)
LATEST=$(DATABASE_URL="$RAILWAY_DATABASE_URL" .venv/bin/alembic heads 2>/dev/null | grep -o "[a-f0-9]\{12\}" | head -1)

if [ "$CURRENT" == "$LATEST" ]; then
    echo -e "${GREEN}✅ Production database is up to date!${NC}"
else
    echo -e "${YELLOW}⚠️  There are pending migrations!${NC}"
    echo "Current: $CURRENT"
    echo "Latest:  $LATEST"
    echo ""
    echo "Run './migrate_production.sh' to apply migrations"
fi