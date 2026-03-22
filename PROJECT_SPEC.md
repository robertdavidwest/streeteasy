# StreetEasyAndMe - Project Specification

**Domain:** streeteasyandme.com
**Created:** 2026-03-21
**Status:** Local Development Setup Complete

## Overview

StreetEasyAndMe is a web application for tracking and managing apartment rental search activities. It integrates with an existing StreetEasy scraper to provide a personalized interface for browsing listings, favoriting apartments, and maintaining a timestamped history of rental search activities.

## Problem Statement

Apartment hunting requires tracking multiple listings, remembering which apartments you've contacted, viewed, or are interested in. This app provides a centralized system to:
- Browse all scraped StreetEasy listings
- Mark favorites for apartments of interest
- Maintain timestamped event history (reach outs, viewings, etc.)
- Add notes and track interactions with each listing

## Architecture

### Technology Stack

**Frontend:**
- React (client-side rendering)
- Vite (build tool & dev server)
- Modern responsive design (mobile-friendly web app)

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Alembic (database migrations)
- Python 3.13+ (using psycopg v3 driver)
- uv (Python package manager)

**Database:**
- PostgreSQL (hosted on Railway.com)
- Shared database with existing scraper

**Deployment:**
- Frontend: Render.com (Docker container serving static build)
- Backend: Render.com (Docker container)
- Database: Railway.com (existing setup)
- Both services deployed independently

**Development:**
- No Docker for local development (direct execution)
- Hot reload for both frontend and backend
- Local PostgreSQL database

### Project Structure

```
streeteasilyandme/
├── scraper/                    # Existing StreetEasy scraper (independent)
│   ├── main.py
│   ├── street_easy_api.py
│   ├── street_easy_config.py
│   ├── postgres.py
│   └── telegram.py
│
├── backend/
│   ├── src/                    # FastAPI application code
│   │   ├── api/               # API routes
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # FastAPI app entry point
│   ├── alembic/               # Database migrations
│   ├── tests/
│   ├── pyproject.toml
│   └── README.md
│
├── frontend/
│   ├── src/                   # React application code
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.tsx           # Main app component
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── PROJECT_SPEC.md            # This file
└── README.md                  # Main project documentation
```

## Core Features

### 1. Listing Browser
- Display all scraped StreetEasy listings
- Sort by most recent first (scrape date/creation date)
- Pagination or infinite scroll
- Filter capabilities (neighborhood, price, bedrooms, etc.)
- Placeholder images (to be replaced with actual listing images once scraper is updated)

### 2. Favorites Management (CRUD)
- Mark/unmark listings as favorites
- View all favorited listings
- Remove from favorites (soft delete)
- Restore deleted favorites
- Permanently delete favorites
- Track favorite state (interested, reached_out, showing_scheduled, viewed, applied, rejected)
- Schedule showing datetime for favorites

### 3. Event Timeline
Each favorited listing maintains a timestamped event history:
- Event types: "Reached out to agent", "Viewed apartment", "Applied", "Custom"
- Timestamp for each event
- Notes field for each event (optional)
- Chronological display of events per listing

### 4. Notes System
- Add/edit/delete notes on favorited listings
- Rich text or markdown support (optional enhancement)
- Timestamp tracking for note creation/updates

## Data Model

### Existing Tables (from scraper)
- `rentals` - StreetEasy listing data (Greenpoint, Brooklyn only for MVP)
  - `id` (TEXT, PK) - StreetEasy listing ID
  - `url` (TEXT) - StreetEasy listing URL
  - `bedrooms` (INTEGER)
  - `bathrooms` (REAL)
  - `price` (INTEGER) - Monthly rent
  - Future: Add `image_urls`, `address`, `description`, `created_at` fields

### New Tables (to be created)

**users**
- `id` (PK, UUID)
- `email` (unique, indexed)
- `password_hash` (bcrypt)
- `created_at`
- `updated_at`

**favorites**
- `id` (PK)
- `user_id` (FK to users)
- `rental_id` (FK to rentals.id, TEXT)
- `current_state` (enum: 'interested', 'reached_out', 'showing_scheduled', 'viewed', 'applied', 'rejected')
- `showing_datetime` (timestamp, nullable)
- `is_deleted` (boolean, default false) - Soft delete flag
- `state_updated_at` (timestamp)
- `created_at`
- `updated_at`
- Unique constraint on (user_id, rental_id)

**events**
- `id` (PK)
- `favorite_id` (FK to favorites)
- `event_type` (enum: 'reached_out', 'viewed', 'applied', 'custom')
- `event_date` (timestamp)
- `notes` (text, optional)
- `created_at`
- `updated_at`

## API Design

### Endpoints (FastAPI)

**Authentication** (public endpoints)
- `POST /api/auth/signup` - Register first user (disabled after first signup)
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user info

**Rentals** (protected)
- `GET /api/rentals` - List all rental listings (paginated, filterable)
- `GET /api/rentals/{id}` - Get single rental detail

**Favorites** (protected)
- `GET /api/favorites` - List all favorites (includes soft-deleted)
- `POST /api/favorites` - Add listing to favorites
- `GET /api/favorites/{id}` - Get favorite detail with events
- `PUT /api/favorites/{id}` - Update favorite state and showing datetime
- `DELETE /api/favorites/{id}` - Soft delete favorite (sets is_deleted=true)
- `PATCH /api/favorites/{id}/restore` - Restore soft-deleted favorite
- `DELETE /api/favorites/{id}/permanent` - Permanently delete favorite from database

**Events** (protected - notes are part of events)
- `POST /api/favorites/{favorite_id}/events` - Add event to favorite
- `PUT /api/events/{event_id}` - Update event
- `DELETE /api/events/{event_id}` - Delete event

## Authentication & Authorization

**Phase 1 (MVP):** First signup wins

**Registration:**
- First user to register gets access, then signup is disabled
- Email + password only (no username)
- Strong password requirements:
  - Minimum 12 characters
  - Must include: uppercase, lowercase, number, special character
  - Validated against common password patterns
- Passwords hashed with bcrypt (work factor 12)
- Email uniqueness enforced

**Login/Session:**
- JWT tokens for API authentication
- 7-day token expiry with refresh tokens
- Tokens stored in httpOnly cookies (secure)

**Security:**
- All API endpoints (except /login, /signup) require authentication
- User-scoped data (favorites, events, notes)
- `/signup` endpoint checks if users exist - returns 403 if any user exists

**MVP Limitations:**
- No password reset flow (manual DB reset if needed)
- No email verification
- No 2FA
- Single user only

**Phase 2 (Future):**
- Password reset flow with email
- Email verification
- Multi-factor authentication
- Multi-user support with invite system

## Development Workflow

### Local Development
1. Install dependencies: `uv` for Python, `npm` for frontend
2. Set up local PostgreSQL database (see README.md for detailed instructions)
3. Run migrations: `cd backend && .venv/bin/alembic upgrade head`
4. Start backend: `./backend/start_server.sh` (or `uvicorn src.main:app --reload --port 8000`)
5. Start frontend: `cd frontend && npm run dev`
6. Frontend: http://localhost:5173
7. Backend API: http://localhost:8000
8. API Docs: http://localhost:8000/docs (auto-generated by FastAPI)

### Production Migrations
- Run migrations on Railway database: `cd backend && DATABASE_URL=$RAILWAY_DATABASE_URL .venv/bin/alembic upgrade head`

### Code Style
- **Python:** Follow user's CLAUDE.md rules (type hints, 79 char lines, mypy, black, flake8)
- **SQL:** 120 character max line length
- **React/TypeScript:** Standard Prettier/ESLint setup

### Testing
- Backend: pytest for API tests
- Frontend: Vitest + React Testing Library
- E2E: Optional (Playwright or Cypress)

## Deployment

### Render.com Setup
**Backend Service (Web Service):**
- Environment: Python 3
- Build Command: `cd backend && pip install uv && uv pip install -e .`
- Start Command: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- Root directory: `/`
- Environment variables:
  - `DATABASE_URL` (from Railway)
  - `SECRET_KEY` (generate with `openssl rand -hex 32`)

**Frontend Service (Static Site):**
- Build Command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Root directory: `/`
- Environment variables:
  - `VITE_API_URL` (backend service URL)

**Post-Deployment:**
- Run migrations: SSH into backend service or use Render Shell
  - `cd backend && .venv/bin/alembic upgrade head`

### Database
- PostgreSQL on Railway.com (existing)
- Connect via `DATABASE_URL` environment variable

## Future Enhancements

### Phase 2 Features
1. **Image Support**
   - Update scraper to pull listing image URLs
   - Store in `listings.image_urls` (array or JSON)
   - Display in listing cards and detail views

2. **Advanced Filtering**
   - Neighborhood map view
   - Price range slider
   - Multiple filter combinations
   - Saved searches

3. **Notifications**
   - Email/SMS reminders for follow-ups
   - New listing alerts matching criteria

4. **Data Export**
   - Export favorites to PDF or spreadsheet
   - Share listing collections

5. **Analytics**
   - Search activity tracking
   - Response rate tracking
   - Time-to-rent metrics

## Open Questions & Decisions Needed

1. **Event vs Notes:** Should notes be separate from events, or should every event have an optional note field?
   - **Decision:** Merge them - events have an optional notes field

2. **Image Placeholders:** What should placeholder images look like?
   - **Decision:** Use a simple building icon or StreetEasy logo placeholder

3. **Listing Refresh:** How often should the scraper run? How do we handle stale/removed listings?
   - **Decision:** TBD - discuss with user

4. **Favorite Limit:** Any limit on number of favorites?
   - **Decision:** No limit for MVP

## Success Criteria

### MVP (Minimum Viable Product)
- [x] Database schema created (users, favorites, events)
- [x] Backend API scaffolded with FastAPI
- [x] Frontend scaffolded with React + Vite
- [x] Local development environment working
- [x] Can browse all scraped listings with filters
- [x] Can favorite/unfavorite listings (soft delete with restore)
- [x] Can add events with timestamps to favorites
- [x] Can add notes to events
- [x] Can track favorite state (interested, reached_out, etc.)
- [x] Responsive design works on mobile browsers
- [ ] Deployed to Render.com and accessible via streeteasyandme.com

### V1.0
- [ ] Image support in listings
- [ ] Advanced filtering and search
- [ ] Polish UI/UX
- [ ] Performance optimization for large datasets

## Timeline

- **Week 1:** Project setup, database schema, basic API endpoints
- **Week 2:** Frontend scaffolding, listing browser, favorites CRUD
- **Week 3:** Events system, notes, polish
- **Week 4:** Testing, deployment, domain setup

---

*This specification is a living document and will be updated as the project evolves.*
