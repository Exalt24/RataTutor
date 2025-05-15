# RataTutor - AI-Powered Study Assistant

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.10+-yellow)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)

A full-stack AI-powered study assistant that converts your notes into flashcards, summaries, and quiz questions. Like a tiny chef guiding your culinary creations, RataTutor helps prepare the perfect recipe for exam success!

## 🚀 Overview

- **Backend:** Django + Django REST Framework + django-cors-headers  
- **Frontend:** React + Vite + Tailwind CSS
- **AI Integration:** OpenRouter API for AI text generation
- **Development:** Single command (`npm run dev`) to run everything
- **API Proxy:** Frontend `/api/*` requests automatically forwarded to Django

## 📋 Prerequisites

- **Python 3.10+**: For backend development and Django
- **Node.js 20.x**: For frontend development with React
- **Git**: For version control and collaboration
- **OpenRouter API key**: For AI-powered functionality
- **Docker** (optional): For containerized development and deployment

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Exalt24/RataTutor.git
cd RataTutor
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
# OPENROUTER_API_KEY=<your-api-key>

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
# VITE_APP_TITLE="RataTutor"

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
docker build -t ratatutor . && \
docker run --rm -it -p 8000:8000 \
  -e SECRET_KEY="<your-secret>" \
  -e DEBUG=True \
  -e EMAIL_HOST_USER="<your-email>" \
  -e EMAIL_HOST_PASSWORD="<your-google-api-app-password>" \
  -e OPENROUTER_API_KEY="<your-openrouter-api-key>" \
  ratatutor
```

Then verify these three things work:

1. **Database migrations** completed without errors
2. **API test endpoint** works at [http://localhost:8000/api/ping/](http://localhost:8000/api/ping/)
3. **Frontend** loads at [http://localhost:3000](http://localhost:3000) displaying "Backend says: pong"

If any step fails, report an issue before continuing your work.

## 🗂️ Project Structure

```
RataTutor/
├─ backend/                   # Django REST API server
│  ├─ accounts/               # User authentication and profile management
│  ├─ api/                    # Core API functionality and endpoints
│  ├─ venv/                   # Python virtual environment (gitignored)
│  ├─ RataTutor/              # Django project settings & configuration
│  ├─ .env                    # Environment variables (gitignored)
│  ├─ db.sqlite3              # Database file (gitignored)
│  ├─ manage.py               # Django management script
│  └─ requirements.txt        # Python dependencies
│
├─ frontend/                  # React + Vite + Tailwind application
│  ├─ public/                 # Static assets and resources
│  ├─ src/                    # React components and application logic
│  │  ├─ assets/             # Static assets and resources
│  │  ├─ components/         # Reusable UI components
│  │  ├─ pages/              # Page-level components
│  │  ├─ services/           # API integration and services
│  │  ├─ App.jsx             # Main application component
│  │  ├─ config.js           # Application configuration
│  │  ├─ index.css           # Global CSS styles
│  │  └─ main.jsx            # Application entry point
│  ├─ .env                    # Base environment variables (gitignored)
│  ├─ .env.development        # Development environment variables (gitignored)
│  ├─ .env.production         # Production environment variables (gitignored)
│  ├─ eslint.config.js        # ESLint configuration
│  ├─ index.html              # HTML entry point
│  ├─ package.json            # Frontend dependencies and scripts
│  ├─ package-lock.json       # Frontend dependency lock file
│  └─ vite.config.js          # Vite bundler configuration
│
├─ docker-entrypoint.sh       # Docker container startup script
├─ Dockerfile                 # Docker container definition
├─ package.json               # Root scripts & dependencies
├─ package-lock.json          # Root dependency lock file
├─ LICENSE                    # MIT License file
└─ README.md                  # Project documentation
```

## 🚀 Features

- **Note Upload & Processing**: Upload study materials in various formats (PDF, DOCX, TXT)
- **AI-Powered Content Generation**:
  - Generate flashcards with question/answer pairs
  - Create concise summaries of key concepts
  - Produce practice quiz questions to test knowledge
- **User Management**: Secure account creation and authentication system
- **Material Organization**: Save, categorize, and manage study materials
- **Progress Tracking**: Monitor learning progress and quiz performance
- **Responsive Design**: Study seamlessly across desktop and mobile devices
- **Offline Access**: Download generated study materials for offline use

## 🖼️ Screenshots & Showcase

<div align="center">
  <p><i>Coming soon! Screenshots and GIFs of RataTutor in action will be added here.</i></p>
  <!-- Placeholder for future screenshots -->
  <table>
    <tr>
      <td align="center">
        <img src="https://via.placeholder.com/400x225?text=Upload+Notes+Screen" alt="Upload Notes Screen"/>
        <br/>
        <em>Upload Notes</em>
      </td>
      <td align="center">
        <img src="https://via.placeholder.com/400x225?text=Flashcards+Generation" alt="Flashcards Generation"/>
        <br/>
        <em>Flashcards Generation</em>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://via.placeholder.com/400x225?text=Quiz+Mode" alt="Quiz Mode"/>
        <br/>
        <em>Quiz Mode</em>
      </td>
      <td align="center">
        <img src="https://via.placeholder.com/400x225?text=Study+Summary" alt="Study Summary"/>
        <br/>
        <em>Study Summary</em>
      </td>
    </tr>
  </table>
</div>

## 🤝 Contributing

1. **Create a branch** from `main` with a descriptive name
2. **Make focused commits** that address specific issues
3. **Push your branch** and open a Pull Request against `main`
4. **Run the verification test** before requesting a code review

## 🐳 Local Docker Test

1. **Build the image**

   ```bash
   docker build -t ratatutor .
   ```
2. **Run the container**

   ```bash
   docker run --rm -it \
     -p 8000:8000 \
     -e SECRET_KEY="<your-secret>" \
     -e DEBUG=True \
     -e DATABASE_URL="sqlite:///db.sqlite3" \
     -e OPENROUTER_API_KEY="<your-openrouter-api-key>" \
     ratatutor
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
   * **Env Vars:** set `SECRET_KEY`, `DEBUG`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `OPENROUTER_API_KEY`
3. **Create** and let Render build/deploy

Your service URL:

```
https://<your-service-name>.onrender.com/
```

* API ping: `/api/ping/`
* SPA: `/`

**Demo Site:** To see a working example, visit [https://ratatutor.onrender.com](https://ratatutor.onrender.com)

## 👨‍👩‍👧‍👦 Team & Acknowledgements

RataTutor was created by:

- **Daniel Alexis Cruz** ([@Exalt24](https://github.com/Exalt24))
- **Nikka Joie Mendoza** ([@nikkamendoza](https://github.com/nikkamendoza))
- **Shaira Joy Macale** ([@howtodoitpleasehelp](https://github.com/howtodoitpleasehelp))
- **Vince Quinañola** ([@binskyut](https://github.com/binskyut))
- **Mc Clareenz Zerrudo** ([@clareenz](https://github.com/clareenz))

Special thanks to all contributors and supporters who helped make this project possible.

## 📚 Resources & Documentation

* [Django REST Framework Documentation](https://www.django-rest-framework.org/)
* [Vite + React Guide](https://vitejs.dev/guide/)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs/)
* [OpenRouter API Documentation](https://openrouter.ai/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <img src="https://via.placeholder.com/100x100?text=RataTutor" alt="RataTutor Logo" width="80"/>
  <p>
    <b>Anyone Can Cook Up Knowledge</b><br/>
    Crafted with ❤️ by the RataTutor Team © 2025
  </p>
</div>