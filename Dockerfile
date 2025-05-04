# ┌─────────────────────────────┐
# │ Stage 1: Build the frontend │
# └─────────────────────────────┘
FROM node:20-alpine AS frontend-build

# Declare ARGs with defaults matching your Render URL and title
ARG VITE_API_URL="https://webengfinalexam.onrender.com/api/"
ARG VITE_AUTH_URL="https://webengfinalexam.onrender.com/auth/"
ARG VITE_APP_TITLE="WebEngFinalExam"
ARG VITE_DEBUG="false"

# Export them so Vite picks them up during `npm run build`
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_URL=${VITE_AUTH_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_DEBUG=${VITE_DEBUG}

WORKDIR /app/frontend

# 1. Copy only package files (cache npm install)
COPY frontend/package.json frontend/package-lock.json ./

# 2. Install & build
RUN npm ci

# 3. Copy source & build
COPY frontend/ ./
RUN npm run build



# ┌────────────────────────────┐
# │ Stage 2: Build the backend │
# └────────────────────────────┘
FROM python:3.10-slim AS backend-build

# Install system deps (for psycopg2, etc.)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Python deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copy Django code
COPY backend/ ./

# 3. Copy the frontend build into Django staticfiles
COPY --from=frontend-build /app/frontend/dist ./staticfiles

# Create your templates folder and copy index.html there
RUN mkdir -p WebEngFinalExam/templates \
 && cp staticfiles/index.html WebEngFinalExam/templates/index.html

# 4. Copy & mark entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose port and set entrypoint
EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
