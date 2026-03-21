#!/bin/bash
cd "$(dirname "$0")"
.venv/bin/uvicorn src.main:app --reload --port 8000
