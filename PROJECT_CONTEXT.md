# StreetEasy Scraper Project Context

## Project Structure

### Backend (FastAPI + PostgreSQL)
- **Location**: `/backend`
- **Python Environment**: `.venv` (Python 3.13)
- **Main Components**:
  - `src/models/` - SQLAlchemy models (User, Rental, Favorite, Event)
  - `src/schemas/` - Pydantic schemas for API validation
  - `src/api/` - API route handlers
  - `src/services/` - Business logic services
  - `alembic/` - Database migrations

### Frontend (React + TypeScript)
- **Location**: `/frontend`
- **Tech Stack**: Vite, React, TypeScript
- **Key Files**:
  - `src/pages/` - Main page components (FavoritesPage, RentalsPage, etc.)
  - `src/services/api.ts` - API client service
  - `src/contexts/AuthContext.tsx` - Authentication context

### Scraper
- **Location**: `/scraper`
- **Purpose**: Scrapes StreetEasy listings and stores in PostgreSQL

## Database Management

### Local Database
```bash
# Run migrations locally
cd /Users/Robert.West/robert_github/scrape_streeteasy/backend
./run_migrations.sh
```

### Production Database
```bash
# Run migrations on production (Railway)
# Store DATABASE_URL in environment variable or .env file (NEVER commit to git)
cd /Users/Robert.West/robert_github/scrape_streeteasy/backend
DATABASE_URL="<YOUR_PRODUCTION_DATABASE_URL>" .venv/bin/alembic upgrade head
```

### Creating New Migrations
```bash
# Auto-generate migration from model changes
cd /Users/Robert.West/robert_github/scrape_streeteasy/backend
./create_migration.sh "Description of changes"

# Or manually:
.venv/bin/alembic revision --autogenerate -m "Description"
```

## Important Notes

### Alembic Configuration
- **Config File**: `backend/alembic.ini`
- **Migrations Path**: `backend/alembic/versions/`
- **CRITICAL**: Alembic looks for the `alembic` directory relative to where the command is run
- **ALWAYS** run alembic commands from the `/backend` directory

### Common Issues & Solutions

1. **"Path doesn't exist: alembic"** error
   - Solution: Run commands from the `/backend` directory
   - The `alembic.ini` file has `script_location = alembic` which is relative

2. **"command not found: __zoxide_z"** error
   - This is a shell configuration issue, can be ignored
   - Commands still execute successfully

3. **Database URL**
   - Local: Set in `.env` file or use default
   - Production: Must be passed as environment variable (NEVER commit to git)

## Development Workflow

### Starting the Application

1. **Backend**:
```bash
cd backend
./start_server.sh
# Or: .venv/bin/uvicorn src.main:app --reload
```

2. **Frontend**:
```bash
cd frontend
npm run dev
```

### Making Database Schema Changes

1. Modify the model in `backend/src/models/`
2. Update corresponding schemas in `backend/src/schemas/`
3. Update API endpoints if needed in `backend/src/api/`
4. Create migration:
   ```bash
   cd backend
   ./create_migration.sh "Add field_name to table_name"
   ```
5. Run migration locally:
   ```bash
   ./run_migrations.sh
   ```
6. Update frontend TypeScript interfaces in `frontend/src/services/api.ts`
7. Update frontend components as needed
8. Test locally
9. Commit changes
10. Run migration on production (using secure environment variable)

## Key Models & Relationships

- **User**: Has many favorites
- **Rental**: Listing details from StreetEasy
- **Favorite**: Links User to Rental, tracks state (interested, reached_out, showing_scheduled, viewed, applied, rejected)
  - Fields: `current_state`, `showing_datetime`, `not_interested_reason`, `is_deleted`
- **Event**: History of state changes for a Favorite

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string (NEVER commit)
- `SECRET_KEY`: JWT secret (NEVER commit)
- `ALGORITHM`: JWT algorithm (default: HS256)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## Git Workflow

1. Make changes
2. Add specific files (avoid `git add -A`):
   ```bash
   git add backend/src/models/file.py frontend/src/pages/Component.tsx
   ```
3. Commit with descriptive message:
   ```bash
   git commit -m "Feature: Add description"
   ```
4. Push to main:
   ```bash
   git push origin main
   ```

## Security Best Practices

### NEVER commit to git:
- Database URLs with credentials
- API keys
- JWT secrets
- Any passwords or tokens

### Store sensitive data in:
- Environment variables
- `.env` files (make sure they're in `.gitignore`)
- Secure key management services (for production)

## Production Deployment

- **Backend**: Deployed on Railway
- **Database**: PostgreSQL on Railway
- **Frontend**: Can be deployed on Vercel/Netlify

## Useful Commands Reference

```bash
# Check current migration state
DATABASE_URL="<url>" backend/.venv/bin/alembic current

# Show migration history
DATABASE_URL="<url>" backend/.venv/bin/alembic history

# Downgrade migration (if needed)
DATABASE_URL="<url>" backend/.venv/bin/alembic downgrade -1

# Generate SQL without running (preview)
DATABASE_URL="<url>" backend/.venv/bin/alembic upgrade --sql head
```