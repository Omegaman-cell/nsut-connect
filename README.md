# NSUT Connect

A complete campus community prototype, built from the React/FastAPI starter in your Scans folder. The interface takes its cues from a campus commons and noticeboard: warm paper, forest green, editorial typography, custom campus line art, and a responsive three-column layout.

## Run locally

On this Windows computer, right-click **start.ps1** and choose **Run with PowerShell**, or run:

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

The launcher reuses installed dependencies, installs missing dependencies if necessary, and opens http://localhost:5173. It starts the backend and frontend as hidden processes and writes logs to `work/`. Run `stop.ps1` to stop processes started by the launcher. Existing services on the two app ports are reused only if they identify as NSUT Connect.

For a different computer, install Node.js 22+ and Python 3.11+, then use two terminals:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

```powershell
cd frontend
npm ci
npm run dev
```

API documentation: http://127.0.0.1:8000/docs.

## What works

- Student and admin demo sign-in, session restore, sign-out, and API role checks.
- Feed with category filters, full-text search, latest/most-liked sorting, likes, bookmarks, creating posts, and threaded replies.
- Dedicated discussion topics, saved collection, and complete announcement details.
- Admin announcement creation, editing, pinning, removal, and post moderation.
- Profile editing with available branch/semester choices.
- All supplied timetable data: CSE (1, 7), CSAI (1, 7), CSDS (5), MAC (5). Day/week views and CSV download.
- Notification inbox with unread indicators and mark-as-read.
- Mobile navigation, accessible form labels, keyboard focus, modal focus trap, Escape to close, and Ctrl/Cmd+K search.
- Installable web manifest and service worker for the production build. After visiting the production app, cached timetable content can be viewed offline. This is a responsive web app/PWA, not a native Android or iOS binary.

## Data and authentication

The local app reads sample data from `backend/store.py`, serves it through real API endpoints, and persists edits to `backend/runtime/data.json`. No database is required. Stop the server before resetting that runtime file to return to the seed data. Local sessions last 24 hours and are cleared when the backend restarts. Changing a profile does not rewrite historical post authors.

When deployed as a static frontend, the app supports the **frontend submission track**: it uses the same sample dataset through a browser-local API adapter. Its data is stored in that browser and is not shared between devices. A static deployment does not host Python or provide production campus authentication. Running the app locally provides the full FastAPI implementation.

Demo accounts: `student@nsut.ac.in` and `admin@nsut.ac.in`. No passwords are needed for these clearly labelled demo roles. All notices and schedules are illustrative sample data, not official live university information.

### Enable actual Google sign-in in the local app

Create a Google OAuth web client with `http://localhost:5173` as an authorized JavaScript origin. Set these environment variables in the backend terminal before starting the server:

```powershell
$env:GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
$env:ADMIN_EMAILS = 'authorized-admin@nsut.ac.in'
$env:ALLOW_DEMO = 'false'
```

The UI renders Google's sign-in button when configured. The server verifies Google's ID token, audience, verified email, `nsut.ac.in` hosted domain and email suffix. Admin roles come only from the server-configured email allowlist. Keep demo sign-in disabled when using actual campus accounts. No OAuth secrets or credentials are included in this project.

## Validation

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install httpx
.\.venv\Scripts\python.exe -m unittest test_api -v
```

Four API integration tests cover authentication/authorization boundaries, post/reply/like/save persistence, admin CRUD, profile validation and timetable grouping. Each test uses isolated temporary data. The React production build also passes with `npm run build`. Real Google sign-in requires your own client configuration and was not tested with a campus account.

## Project structure

`frontend/src/App.jsx` contains the screens and flows. `App.css` contains the design system and responsive layouts. `api.js` routes local requests to FastAPI and hosted requests to the browser demo adapter. `backend/main.py` implements the API; `store.py` preserves the supplied seed data.
