# StreetEasyAndMe - Project Specification

**Domain:** streeteasyandme.com
**Created:** 2026-03-21
**Status:** Planning & Initial Development

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
- Python 3.11+

**Database:**
- PostgreSQL (hosted on Railway.com)
- Shared database with existing scraper

**Deployment:**
- Frontend: Render.com (Docker container serving static build)
- Backend: Render.com (Docker container)
- Database: Railway.com (existing setup)
- Both services deployed independently

**Development:**
- Docker Compose for local development
- Hot reload for both frontend and backend

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
│   ├── Dockerfile
│   ├── requirements.txt
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
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml         # Local development setup
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
- Remove from favorites

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

**Listings** (protected)
- `GET /api/listings` - List all listings (paginated, filterable)
- `GET /api/listings/{id}` - Get single listing detail

**Favorites** (protected)
- `GET /api/favorites` - List all favorites
- `POST /api/favorites` - Add listing to favorites
- `DELETE /api/favorites/{id}` - Remove from favorites
- `GET /api/favorites/{id}` - Get favorite detail with events

**Events**
- `POST /api/favorites/{id}/events` - Add event to favorite
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/favorites/{id}/events` - List events for a favorite

**Notes**
- `POST /api/favorites/{id}/notes` - Add note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

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
1. Start PostgreSQL (via Railway connection or local Docker)
2. Run `docker-compose up` to start both frontend and backend
3. Frontend: http://localhost:5173 (Vite default)
4. Backend: http://localhost:8000
5. API Docs: http://localhost:8000/docs (auto-generated by FastAPI)

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
**Backend Service:**
- Build: Docker
- Root directory: `backend/`
- Environment variables: DATABASE_URL (from Railway)

**Frontend Service:**
- Build: Docker (multi-stage: build + nginx serve)
- Root directory: `frontend/`
- Environment variables: VITE_API_URL (backend service URL)

### Database
- PostgreSQL on Railway.com (existing)
- Run migrations via Alembic on backend deployment

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
- [ ] Can browse all scraped listings
- [ ] Can favorite/unfavorite listings
- [ ] Can add events with timestamps to favorites
- [ ] Can add notes to events
- [ ] Responsive design works on mobile browsers
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
