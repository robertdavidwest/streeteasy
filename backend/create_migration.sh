#!/bin/bash
cd "$(dirname "$0")"
.venv/bin/alembic revision --autogenerate -m "Update EventType enum to match favorite states"
