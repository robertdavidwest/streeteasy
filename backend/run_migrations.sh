#!/bin/bash
cd "$(dirname "$0")"
.venv/bin/alembic upgrade head
