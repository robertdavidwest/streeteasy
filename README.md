# StreetEasyAndMe

**Domain:** [streeteasyandme.com](https://streeteasyandme.com)

A web application for tracking and managing your NYC apartment rental search. Browse scraped StreetEasy listings, favorite apartments, and maintain a timestamped history of your rental search activities.

## Project Overview

This repository contains three components:

1. **Scraper** (`scraper/`) - Automated StreetEasy listing scraper with Telegram notifications
2. **Backend** (`backend/`) - FastAPI REST API for managing favorites and events
3. **Frontend** (`frontend/`) - React web application for browsing and tracking listings

See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for complete technical specification.

## Quick Start (Local Development - No Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local or Railway.com)
- `uv` (Python package manager): `pip install uv`

### Initial Setup

**1. Set up local PostgreSQL database**

```bash
# Create database (if doesn't exist)
createdb streeteasy

# Import data from Railway (optional)
# First, install postgres 17 client tools for pg_dump compatibility
brew install postgresql@17

# Dump from Railway
export RAILWAY_DATABASE_URL="your_railway_url_here"
/opt/homebrew/opt/postgresql@17/bin/pg_dump $RAILWAY_DATABASE_URL > railway_dump.sql

# Import to local
psql streeteasy < railway_dump.sql
```

**2. Backend Setup**

```bash
cd backend

# Install dependencies
uv pip install -e .

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your local database URL:
# DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/streeteasy

# Run migrations to create tables
.venv/bin/alembic upgrade head

# Start backend server
./start_server.sh
# Or manually: uvicorn src.main:app --reload --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**3. Frontend Setup** (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

### Using the App

1. Go to http://localhost:5173
2. First time: Sign up (only first user can register)
3. Login and start browsing rentals from Greenpoint, Brooklyn

## Individual Component Setup

### Scraper

The scraper runs independently and populates the PostgreSQL database with StreetEasy listings.

See [scraper/README.md](./scraper/README.md) for setup and usage.

**Quick Start:**
```bash
cd scraper
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://username@localhost:5432/streeteasy"
export TELEGRAM_BOT_TOKEN="your_token"
export TELEGRAM_CHAT_IDS="your_chat_ids"

python main.py
```

### Backend (FastAPI)

See [backend/README.md](./backend/README.md) for API documentation.

**Development:**
```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

### Frontend (React + Vite)

See [frontend/README.md](./frontend/README.md) for component documentation.

**Development:**
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Render.com Deployment

**Backend Service:**
- Root Directory: `backend/`
- Build Command: Docker
- Environment Variables: `DATABASE_URL`

**Frontend Service:**
- Root Directory: `frontend/`
- Build Command: Docker
- Environment Variables: `VITE_API_URL`

**Database:**
- Hosted on Railway.com (existing setup)

See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for detailed deployment instructions.

## Features

### Current (MVP)
- Browse all scraped StreetEasy listings
- Mark listings as favorites
- Add timestamped events (reach outs, viewings, applications)
- Add notes to events
- Responsive web design

### Planned
- Listing images (requires scraper update)
- Advanced filtering and search
- Email/SMS reminders
- Data export
- Analytics dashboard

## Project Structure

```
streeteasilyandme/
├── scraper/           # StreetEasy scraper (independent)
├── backend/           # FastAPI backend
│   ├── src/
│   ├── alembic/       # Database migrations
│   └── Dockerfile
├── frontend/          # React frontend
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml # Local development
├── PROJECT_SPEC.md    # Technical specification
└── README.md          # This file
```

## Contributing

This is a personal project, but if you have suggestions or find bugs, feel free to open an issue.

## License

MIT
