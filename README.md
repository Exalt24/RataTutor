# WebEngFinalExam

A full-stack project template combining Django REST API backend with React, Vite, and Tailwind CSS frontend. Launch both servers with a single command!

## 🚀 Overview

- **Backend:** Django + Django REST Framework + django-cors-headers  
- **Frontend:** React + Vite + Tailwind CSS  
- **Development:** Single command (`npm run dev`) to run everything
- **API Proxy:** Frontend `/api/*` requests automatically forwarded to Django

## 📋 Prerequisites

- Python 3.8 or newer
- Node.js 16 or newer with npm
- Git for version control

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd WebEngFinalExam
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
# .\venv\Scripts\activate.bat

# Install Python dependencies
pip install -r requirements.txt

# Create a new .env file for environment variables
# On macOS/Linux:
touch .env

# On Windows (PowerShell):
# New-Item -Path . -Name ".env" -ItemType "File" -Force

# Generate a Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print('SECRET_KEY=' + get_random_secret_key())"

# Add the following variables to your .env file:
# SECRET_KEY=django-insecure-<your-generated-secret>
# DEBUG=True
# EMAIL_HOST_USER=<your-email>
# EMAIL_HOST_PASSWORD=<your-google-api-app-password>  (Note: use app password for Google APIs, not your actual email password)
# GEMINI_API_KEY=<your-api-key>  (if using Gemini API)

cd ..
```

### 4. Set up the frontend

```bash
cd frontend
npm install

# Create environment files
# On macOS/Linux:
touch .env .env.development .env.production

# On Windows (PowerShell):
# New-Item -Path . -Name ".env" -ItemType "File" -Force
# New-Item -Path . -Name ".env.development" -ItemType "File" -Force
# New-Item -Path . -Name ".env.production" -ItemType "File" -Force

# Add the following configuration to each file:

# For .env (Base variables for all environments):
# VITE_API_URL="http://localhost:8000/api/"
# VITE_APP_TITLE="WebEngFinalExam"

# For .env.development (Development-only variables):
# VITE_DEBUG=true

# For .env.production (Production-only variables):
# VITE_DEBUG=false

# Note: Vite automatically selects the right environment file based on build mode.
# Only variables with the VITE_ prefix are exposed to your React code through import.meta.env.

cd ..
```

## 🏃 Development

Start everything with one command from the project root:

```bash
npm run dev
```

This will:

1. **Start the Django backend server:**
   - Available at [http://localhost:8000](http://localhost:8000)
   - API endpoint at [http://localhost:8000/api/](http://localhost:8000/api/)

2. **Launch the React frontend:**
   - Available at [http://localhost:3000](http://localhost:3000)
   - API calls to `/api/*` are automatically proxied to Django

All server logs appear in the same terminal window for easy monitoring.

## ✅ Quick Verification Test

Run this quick check whenever you pull changes from `main`:

```bash
# 1. Update all dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# 2. Apply database migrations 
cd backend && python manage.py makemigrations && python manage.py migrate && cd ..

# 3. Start the servers
npm run dev

# OR Use Docker
docker build -t webengfinalexam . && \
docker run --rm -it -p 8000:8000 \
  -e SECRET_KEY="<your-secret>" \
  -e DEBUG=True \
  -e DATABASE_URL="sqlite:///db.sqlite3" \
  -e EMAIL_HOST_USER="<your-email>" \
  -e EMAIL_HOST_PASSWORD="<your-google-api-app-password>" \
  -e GEMINI_API_KEY="<your-gemini-app-key>" \
  webengfinalexam
```

Then verify these three things work:

1. **Database migrations** completed without errors
2. **API test endpoint** works at [http://localhost:8000/api/ping/](http://localhost:8000/api/ping/)
3. **Frontend** loads at [http://localhost:3000](http://localhost:3000) displaying "Backend says: pong"

If any step fails, report an issue before continuing your work.

## 🗂️ Project Structure

```
WebEngFinalExam/
├─ backend/                   # Django REST API
│  ├─ venv/                   # Python virtual environment
│  ├─ WebEngFinalExam/        # Project settings & URLs
│  ├─ api/                    # API app (models, views, serializers)
│  ├─ manage.py               # Django command line tool
│  └─ requirements.txt        # Python dependencies
│
├─ frontend/                  # React + Vite + Tailwind app
│  ├─ public/                 # Static assets
│  ├─ src/                    # React components & logic
│  ├─ vite.config.js          # Vite configuration
│  ├─ tailwind.config.js      # Tailwind CSS settings
│  ├─ package.json            # Frontend dependencies
│  └─ .env.*                  # Environment files for different modes
│
├─ package.json               # Root scripts & dependencies
└─ .gitignore                 # Git ignore patterns
```

## 🤝 Contributing

1. **Create a branch** from `main` with a descriptive name
2. **Make focused commits** that address specific issues
3. **Push your branch** and open a Pull Request against `main`
4. **Run the verification test** before requesting a code review

## 🐳 Local Docker Test

1. **Build the image**

   ```bash
   docker build -t webengfinalexam .
   ```
2. **Run the container**

   ```bash
   docker run --rm -it \
     -p 8000:8000 \
     -e SECRET_KEY="<your-secret>" \
     -e DEBUG=True \
     -e DATABASE_URL="sqlite:///db.sqlite3" \
     webengfinalexam
   ```
3. **Verify**

   * API ping: [http://localhost:8000/api/ping/](http://localhost:8000/api/ping/) → `{"message":"pong"}`
   * SPA:        [http://localhost:8000/](http://localhost:8000/)        → your React app

## 🚀 Deployment on Render

Render will build your Docker image and deploy one service for both backend and frontend.

1. **Push** your code and Docker files:

   ```bash
   git add Dockerfile docker-entrypoint.sh
   git commit -m "Add Docker deploy config"
   git push origin main
   ```
2. In Render dashboard → **New → Web Service**

   * **Environment:** Docker
   * **Root Directory:** *leave blank* (Dockerfile in repo root)
   * **Env Vars:** set `SECRET_KEY`, `DEBUG`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `GEMINI_API_KEY`
3. **Create** and let Render build/deploy

Your service URL:

```
https://<your-service-name>.onrender.com/
```

* API ping: `/api/ping/`
* SPA: `/`

**Demo Site:** To see a working example, visit [https://webengfinalexam.onrender.com](https://webengfinalexam.onrender.com)

## 📚 Resources

* [Django REST Framework Documentation](https://www.django-rest-framework.org/)
* [Vite + React Guide](https://vitejs.dev/guide/)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs/)