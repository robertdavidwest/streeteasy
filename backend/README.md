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

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
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
- `GET /api/favorites` - List user's favorites
- `POST /api/favorites` - Add favorite
- `GET /api/favorites/{id}` - Get favorite detail
- `DELETE /api/favorites/{id}` - Remove favorite

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
