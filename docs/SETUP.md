# Setup and reference

## Prerequisites

- Python 3.10+
- Node.js 20.19 or newer (the Vite version in `frontend/package.json` requires it)
- An AI endpoint: an OpenRouter API key, or a local Ollama (see "Model setting")
- Docker, optionally, for the container build

Cloudinary and Gmail credentials are not needed to run it locally. In development (`DEBUG=True`) uploads go to `backend/media/` on disk and Cloudinary is never called, and Gmail is only used to send password reset emails. `settings.py` still reads those variables at startup, so they must exist in `.env`, and placeholder values are enough.

## Setup

```bash
git clone https://github.com/Exalt24/RataTutor.git
cd RataTutor
npm install
```

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Generate a Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print('SECRET_KEY=' + get_random_secret_key())"
```

Create `backend/.env` (the `<any-string-for-local-use>` values stand for any text you like in local development, for example `local-dev`; use real ones in production):

```
SECRET_KEY=<paste-the-generated-key-here>
DEBUG=True
EMAIL_HOST_USER=<any-string-for-local-use>
EMAIL_HOST_PASSWORD=<any-string-for-local-use>
OPENROUTER_API_KEY=<your-api-key>
OPENROUTER_MODEL=google/gemma-4-31b-it:free
CLOUDINARY_CLOUD_NAME=<any-string-for-local-use>
CLOUDINARY_API_KEY=<any-string-for-local-use>
CLOUDINARY_API_SECRET=<any-string-for-local-use>
```

`OPENROUTER_MODEL` and `OPENROUTER_BASE_URL` are optional and fall back to the defaults above; for a local model use the three lines from "Run the AI features on a local model" instead of the OpenRouter ones. Then:

```bash
python manage.py migrate
cd ..
```

Stay in the repository root with the virtual environment still activated for the steps below, because the root npm scripts call `python`.

Frontend:

```bash
cd frontend
npm install
```

Create `frontend/.env` with the three variables below. `.env.development` and `.env.production` only need `VITE_DEBUG=true` and `VITE_DEBUG=false`. Only variables with the `VITE_` prefix reach the React code.

```
VITE_API_URL="http://localhost:8000/api/"
VITE_AUTH_URL="http://localhost:8000/auth/"
VITE_APP_TITLE="RataTutor"
```

## Running it

```bash
npm run dev
```

This creates a development test user and starts Django on [http://localhost:8000](http://localhost:8000) and the React dev server on [http://localhost:3000](http://localhost:3000). The front end calls the API at the `VITE_API_URL` and `VITE_AUTH_URL` addresses from `frontend/.env`; the `/api` proxy entries in `vite.config.js` point at port 8000 and are not used while those variables hold absolute URLs. The test user is `testuser` / `testuser@gmail.com` / `t@st12345`, for development only.

To register your own user, the password needs 8 or more characters with a letter, a digit and one of `@$!%*#?&`. Those are the only special characters the backend accepts, so a hyphen or underscore is rejected with the same "include a special char" message.

### Other ports

`npm run dev` has ports 8000 and 3000 written into its script. To use other ports, start the two halves separately from the repository root, here Django on 4850 and the front end on 4851:

```bash
npm run create-test-user
npm run backend -- 4850
npm run frontend -- -- --port 4851 --strictPort
```

and set `VITE_API_URL="http://localhost:4850/api/"` and `VITE_AUTH_URL="http://localhost:4850/auth/"` in `frontend/.env` first. That is how the demo recording above was made.

| Command | What it does |
|---|---|
| `npm run dev` | Backend and frontend together, with test user creation |
| `npm run backend` | Django only |
| `npm run frontend` | Front end only |
| `npm run create-test-user` | Create the test user by hand |
| `npm run reset` | Delete the SQLite database, `media/` and `attachments/`, migrate, and start (Windows) |
| `npm run reset:unix` | The same on macOS and Linux |

`reset` permanently deletes local data, so use it only in development.

## Model setting

All AI calls read one model id from `OPENROUTER_MODEL` and one endpoint from `OPENROUTER_BASE_URL`, both in `backend/.env`. The defaults are `google/gemma-4-31b-it:free` and `https://openrouter.ai/api/v1`. The model used to be a literal `google/gemini-2.0-flash-exp:free` repeated in eight calls in `backend/api/services/ai_service.py`. OpenRouter removed that model from its catalogue and every AI call failed, so the id is now a setting. When a model is retired, pick a current id from `https://openrouter.ai/api/v1/models` and change the environment variable, with no code change.

### Run the AI features on a local model

The base URL setting exists so the app can run with no OpenRouter account. The recording at the top used Ollama with `qwen3:14b` (`ollama pull qwen3:14b`); Ollama serves an OpenAI-compatible API under `/v1`. In `backend/.env`:

```
OPENROUTER_BASE_URL=http://localhost:11434/v1
OPENROUTER_MODEL=qwen3:14b
OPENROUTER_API_KEY=ollama
```

The SDK needs a non-empty key, so any string works for a local server. With that setup, on a desktop with a 16 GB GPU, a ten-card flashcard set, a ten-question quiz and a chat answer each took roughly 10 to 25 seconds. I only tried short notes of about 1 KB: Ollama's default context window was 4096 tokens here, so longer documents would need a larger `num_ctx`, which I have not tested.

## Docker and Render

```bash
docker build -t ratatutor .
docker run --rm -it -p 8000:8000 \
  -e SECRET_KEY="<your-secret>" -e DEBUG=True \
  -e DATABASE_URL="sqlite:///db.sqlite3" \
  -e OPENROUTER_API_KEY="<your-openrouter-api-key>" \
  -e OPENROUTER_MODEL="google/gemma-4-31b-it:free" \
  -e CLOUDINARY_CLOUD_NAME="<name>" -e CLOUDINARY_API_KEY="<key>" -e CLOUDINARY_API_SECRET="<secret>" \
  ratatutor
```

The React app is then at [http://localhost:8000/](http://localhost:8000/) and the API at [http://localhost:8000/api/](http://localhost:8000/api/).

On Render, create a Web Service with the Docker environment and the repository root as the root directory. Set `SECRET_KEY`, `DEBUG`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `OPENROUTER_API_KEY`, optionally `OPENROUTER_MODEL` and `OPENROUTER_BASE_URL`, and the three `CLOUDINARY_*` variables. One service serves both the API at `/api/` and the front end at `/`.

## Troubleshooting

- **Database errors:** `npm run reset`.
- **AI requests failing:** against OpenRouter, check `OPENROUTER_API_KEY`, then check that the model id in `OPENROUTER_MODEL` is still listed at `https://openrouter.ai/api/v1/models`; a retired model id fails every call. Against a local server, check that it is running at `OPENROUTER_BASE_URL` and that the model has been pulled.
- **Upload permission errors:** make sure `backend/media/` and `backend/attachments/` are writable.
- **Port conflicts:** see "Other ports" above.
- **Stuck conversation summaries:** in `python manage.py shell`, run `AIConversation.objects.update(summary_context="", messages_since_summary=0)` after importing it from `api.models`.

## Project structure

```
RataTutor/
├─ backend/
│  ├─ accounts/      authentication, profile, streaks
│  ├─ api/           materials, notes, flashcards, quizzes, conversations
│  │  └─ services/   ai_service.py: text extraction, prompts, generators, summaries
│  ├─ RataTutor/     Django settings and URL config
│  └─ requirements.txt
├─ frontend/
│  └─ src/           components, pages, services (API calls), styles
├─ Dockerfile
├─ docker-entrypoint.sh
└─ package.json      root scripts
```

