# How to understand NSUT Connect

This is ordinary React with function components, hooks, props and plain CSS. The backend is a single FastAPI module with simple functions and JSON data. The first version was too compressed; it is now formatted and the reusable components and three screens have their own files. There are no custom hooks or state-management frameworks to learn.

## Read in this order

1. `frontend/src/main.jsx`: mounts React into the HTML page and registers the production service worker.
2. `frontend/src/pages/Login.jsx`: a small screen. `useState` stores loading/errors, a button calls `api`, and `onLogin` passes the session back to App.
3. `frontend/src/api.js`: sends `/api` requests to FastAPI on localhost. On the hosted demo it changes a browser-local dataset instead. Both return the same objects so the UI works in either mode.
4. `frontend/src/App.jsx`: owns login state, posts, notices, timetable data, filters and the current page. `load` fetches data. Named action functions call the API and update state. JSX below them renders the selected page.
5. `frontend/src/components.jsx`: repeated UI pieces such as Avatar, Modal, PostCard, Compose and Thread. Each receives its data and callbacks as props.
6. `frontend/src/pages/Timetable.jsx` and `Profile.jsx`: their forms and display. `timetable.js` remembers your section; `helpers.js` handles small formatting tasks.
7. `frontend/src/App.css`: all styling, including mobile media queries. `icons.jsx` is an in-house SVG icon map.
8. `backend/main.py`: request models, session/role checks and route functions. `backend/store.py` contains sample posts and accounts; `backend/timetable.json` contains PDF-derived reference schedules.
9. `backend/test_api.py`: examples of making API requests and asserting the results.

## Trace one interaction

Click a post's heart → PostCard calls its `onLike` prop → App's `like` function calls `api('/posts/ID/like', 'POST')` → FastAPI or the browser adapter toggles that user's like → App replaces the updated post in state → React redraws the count.

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

The demo accounts are **Student** (`student@nsut.ac.in`) and **Admin** (`admin@nsut.ac.in`). There is no hardcoded project-owner name. A configured real Google login reads the Google account name, falling back to the email's local part. Profile edits remain under the user's control. Old default demo names are migrated without deleting posts or bookmarks.

The public site has demo sign-in and sign-out. It remembers a session, so returning visitors go straight to the feed; use **Sign out** to see the entry screen. It does not host the Python backend. Real Google authentication requires the local/server backend and your own OAuth client configuration. Browser demo roles are illustrative, not a security boundary.

## Timetable source and limitations

Schedules come from the supplied **Time Table BTech CSE (July-Dec 2026).pdf**. First-year CSE and CSAI have separate section choices. Merged cells retain their actual duration; tutorial-group labels and elective alternatives are preserved. Missing instructors/rooms are marked **Not listed in PDF**, and undefined slots remain labelled **Unassigned slot**. Seventh-semester tables contain all slots, including multiple section/elective alternatives; they are not a personalised course registration. The PDF only links out to CSE/CSAI fifth-semester and third-semester schedules, so those linked schedules have not been invented or imported.

Reference timetable updates replace stale schedules in an existing browser/server dataset while keeping user changes. Local backend edits live in `backend/runtime/data.json`; browser demo edits live in `localStorage`. Neither is a database shared across internet visitors.

## Make a small change

Change a heading in App, a colour in App.css, or one timetable row in timetable.json. For timetable edits, keep `frontend/public/seed.json`'s timetables in sync and increment the browser adapter's timetable version for deployed data refreshes. Run `npm run build` in frontend. For backend logic changes, run `python -m unittest test_api -v` in backend.

For every dependency and the tools used during development, see **DEPENDENCIES.md**.

## Light and dark mode

`theme.js` reads the saved theme or device preference. App stores it in one state variable; an effect writes `data-theme` to the HTML element and saves the choice. `ThemeButton.jsx` toggles it. App.css defines the same semantic colour variables for both themes. A small script in index.html applies the choice before React mounts. No theme library is required.
