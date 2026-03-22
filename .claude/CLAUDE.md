# StreetEasy Project Instructions

## IMPORTANT: Read Project Context
Before starting any work, read the PROJECT_CONTEXT.md file in the root directory which contains:
- Project structure
- Database migration procedures
- Development workflow
- Common issues and solutions

To load context at session start, run:
```
Read PROJECT_CONTEXT.md
```

## Project-Specific Rules

### Database Migrations
- ALWAYS run alembic commands from the `/backend` directory
- Production migrations require DATABASE_URL environment variable
- Use the migration scripts: `create_migration.sh` and `run_migrations.sh`

### Git Commits
- Add specific files, not `git add -A`
- Write clear, descriptive commit messages
- Test locally before pushing to production

### Code Style
- Backend: Follow Python typing requirements (all functions need type hints)
- Frontend: Use TypeScript interfaces for all API responses
- SQL: Maximum 120 characters per line including comments