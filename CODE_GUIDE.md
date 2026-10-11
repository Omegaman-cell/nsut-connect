# How to understand NSUT Connect

This is ordinary React with function components, hooks, props and plain CSS. The public backend is a small JavaScript API using SQL. The original FastAPI backend is retained for local Python development. The first version was too compressed; it is now formatted and the reusable components and three screens have their own files. There are no custom hooks or state-management frameworks to learn.

## Read in this order

1. `frontend/src/main.jsx`: mounts React into the HTML page and registers the production service worker.
2. `frontend/src/pages/Login.jsx`: a small screen. `useState` stores loading/errors, a button calls `api`, and `onLogin` passes the session back to App.
3. `frontend/src/api.js`: sends every request to `/api`. The public server uses an HttpOnly session cookie; the retained Python server uses a bearer token. It never edits a browser-local demo dataset.
4. `frontend/src/App.jsx`: owns login state, posts, notices, timetable data, filters and the current page. `load` fetches data. Named action functions call the API and update state. JSX below them renders the selected page.
5. `frontend/src/components.jsx`: repeated UI pieces such as Avatar, Modal, PostCard, Compose and Thread. Each receives its data and callbacks as props.
6. `frontend/src/pages/Timetable.jsx` and `Profile.jsx`: their forms and display. `timetable.js` remembers your section; `helpers.js` handles small formatting tasks.
7. `frontend/src/App.css`: all styling, including mobile media queries. `icons.jsx` is an in-house SVG icon map.
8. `backend/main.py`: request models, session/role checks and route functions. `backend/store.py` contains sample posts and accounts; `backend/timetable.json` contains PDF-derived reference schedules.
9. `backend/test_api.py`: examples of making API requests and asserting the results.

## Trace one interaction

Click a post's heart → PostCard calls its `onLike` prop → App's `like` function calls `api('/posts/ID/like', 'POST')` → the server toggles that user's like → App replaces the updated post in state → React redraws the count.

## Useful JavaScript syntax

| Syntax | Meaning here |
| --- | --- |
| `useState(value)` | Keep a value across renders; its setter triggers a new render. |
| `useEffect(...)` | Fetch data or attach browser listeners; return cleanup when needed. |
| `useRef(...)` | Keep a DOM reference or timer without rerendering. |
| `items.map(...)` | Render a card for each item. |
| `items.filter(...)` | Keep the items matching a search, topic or day. |
| `{...object, field: value}` | Copy an object and replace one field. |
| `value?.field` / `value || fallback` | Safely read an optional value / supply a fallback. |
| `async` / `await` | Wait for an API response without blocking the browser. |

## Names and login

Google provides the account name on first sign-in; the email's local part is the fallback. Profile editing remains under the user's control. There are no public sample accounts.

The public UI receives a cookie session marker for display state, while the actual session cookie is HttpOnly and inaccessible to JavaScript. Every API request checks the session in D1. Changing localStorage or a role in the browser cannot authenticate or grant admin access.

Read `hosted/server/auth.js` next: `verifyGoogle` validates the JWT with Google's public keys and checks the campus domain. `roleFor` reads the server admin allowlist. Then read `hosted/server/api.js`: it maps URL/method pairs to ordinary async functions and SQL statements. `db/schema.ts` declares the tables; `drizzle/` contains the generated schema migration. `app/api/[...path]/route.ts` connects HTTP requests to that API. `app/campus-app.tsx` loads the browser UI after hydration.

`hosted/tests/auth.test.mjs` generates temporary signing keys to exercise valid and invalid tokens. Those keys are not used by the live server. `api.test.mjs` runs the API against SQLite with a tiny D1 adapter, including ownership and session checks.

## Timetable source and limitations

Schedules come from the supplied **Time Table BTech CSE (July-Dec 2026).pdf**. First-year CSE and CSAI have separate section choices. Merged cells retain their actual duration; tutorial-group labels and elective alternatives are preserved. Missing instructors/rooms are marked **Not listed in PDF**, and undefined slots remain labelled **Unassigned slot**. Seventh-semester tables contain all slots, including multiple section/elective alternatives; they are not a personalised course registration. The PDF only links out to CSE/CSAI fifth-semester and third-semester schedules, so those linked schedules have not been invented or imported.

The public server reads the reference timetables from `hosted/server/seed.json`. Public user edits live in D1; the retained Python backend stores local edits in `backend/runtime/data.json`. Offline timetable snapshots and preferences use browser storage.

## Make a small change

Change a heading in App, a colour in App.css, or one timetable row in timetable.json. For timetable edits, keep `frontend/public/seed.json`'s timetables in sync with `backend/timetable.json`. Run `pnpm run build` in hosted to copy the UI/seed and build the full app. Run `pnpm test` for Worker changes or `python -m unittest test_api -v` in backend for Python changes.

For every dependency and the tools used during development, see **DEPENDENCIES.md**.

## Light and dark mode

`theme.js` reads the saved theme or device preference. App stores it in one state variable; an effect writes `data-theme` to the HTML element and saves the choice. `ThemeButton.jsx` toggles it. App.css defines the same semantic colour variables for both themes. A small script in index.html applies the choice before React mounts. No theme library is required.
