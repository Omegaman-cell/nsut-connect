# NSUT Connect

[Live app](https://nsut-connect.nsut-campus.workers.dev)

A campus app for discussions, announcements and timetables. Sign in with an @nsut.ac.in Google account.

## Run locally

Requires Node.js 22.13 or later and pnpm 11.

```sh
pnpm install
pnpm db:migrate
pnpm dev
```

Create `.dev.vars` with your Google OAuth web client ID and local origin:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
SITE_ORIGIN=http://localhost:5173
ADMIN_EMAILS=admin@nsut.ac.in
```

Register `http://localhost:5173` as an authorized JavaScript origin in Google Cloud. For production, register the deployed origin and set the same environment variables there. `ADMIN_EMAILS` is a comma-separated list of campus accounts allowed to choose Admin at sign-in. Choosing Student creates a student session, including for an admin account.

```sh
pnpm test
pnpm build
```

`client/` contains the React screens and styles, `server/` handles the API and authentication, `app/` connects them, and `db/` and `drizzle/` define the D1 database and migrations.

## Deploy to Cloudflare

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create nsut-connect
```

Put the returned database ID in `wrangler.json`, then run `pnpm deploy`. Add the resulting Workers URL as an authorized JavaScript origin for the Google OAuth client.

Set the production admin accounts with `pnpm exec wrangler secret put ADMIN_EMAILS`.
