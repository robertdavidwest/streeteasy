#!/bin/bash
cd "$(dirname "$0")"
.venv/bin/alembic revision --autogenerate -m "Add users, favorites, events tables"
