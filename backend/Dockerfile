FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies with uv
RUN uv pip install --system -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000
