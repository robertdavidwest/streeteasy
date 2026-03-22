# StreetEasyAndMe Backend

FastAPI backend for StreetEasyAndMe.

## Setup

### Prerequisites
- Python 3.11+
- uv (Python package manager)
- PostgreSQL database

### Installation

```bash
# Install uv if you haven't
pip install uv

# Install dependencies
uv pip install -e .

# For development dependencies
uv pip install -e ".[dev]"
```

### Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate with `openssl rand -hex 32`)

### Database Migrations

**Local Development:**

```bash
# Run migrations
.venv/bin/alembic upgrade head

# Create a new migration (after model changes)
.venv/bin/alembic revision --autogenerate -m "description"

# Rollback
.venv/bin/alembic downgrade -1
```

**Production (Railway.com):**

```bash
# Run migrations on production database
cd backend && DATABASE_URL=$RAILWAY_DATABASE_URL .venv/bin/alembic upgrade head
```

### Running Locally

```bash
# Development server with hot reload
uvicorn src.main:app --reload --port 8000

# API docs available at:
# http://localhost:8000/docs (Swagger)
# http://localhost:8000/redoc (ReDoc)
```

## Project Structure

```
backend/
├── src/
│   ├── api/          # API route handlers
│   ├── core/         # Core config and database
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── main.py       # FastAPI app
├── alembic/          # Database migrations
├── tests/            # Tests
└── pyproject.toml    # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register (first user only)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Rentals
- `GET /api/rentals` - List rentals (with filters)
- `GET /api/rentals/{id}` - Get rental detail

### Favorites
- `GET /api/favorites` - List user's favorites (includes soft-deleted)
- `POST /api/favorites` - Add favorite
- `GET /api/favorites/{id}` - Get favorite detail
- `PUT /api/favorites/{id}` - Update favorite state
- `DELETE /api/favorites/{id}` - Soft delete favorite
- `PATCH /api/favorites/{id}/restore` - Restore soft-deleted favorite
- `DELETE /api/favorites/{id}/permanent` - Permanently delete favorite

### Events
- `POST /api/favorites/{id}/events` - Add event to favorite
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

## Development

```bash
# Run tests
pytest

# Code formatting
black src/

# Linting
flake8 src/
mypy src/
```
