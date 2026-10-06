# ==============================================================================
# MHD REAL ESTATE TECH • BACKEND PRODUCTION DOCKERFILE (FASTAPI + CATBOOST + GIS)
# ==============================================================================

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONUTF8=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies for PostGIS, psycopg2, and CatBoost
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source code, models, and configs
COPY config/ ./config/
COPY database/ ./database/
COPY models/ ./models/
COPY src/ ./src/
COPY data/ ./data/
COPY logomhd.png .
# Fallback .env if not mounted or injected by orchestrator (Coolify / Docker Compose)
RUN if [ ! -f .env ]; then cp .env.example .env; fi

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run FastAPI with Uvicorn
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
