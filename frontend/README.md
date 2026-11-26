# MediConnect frontend

React 19 + TypeScript web portals for patients, doctors, blood donors and hospital admins.

## Run

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

With `VITE_API_MODE=mock` (the default) the app runs on built-in sample data. Sign in by picking a demo role on the login page. Demo data is kept in the browser's localStorage; clear it to start over.

With `VITE_API_MODE=live` the app calls the Spring Boot API on `/api` (proxied to port 8080 in development) and signs in through Keycloak (`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_CLIENT_ID`). The user's role is read from the Keycloak realm roles `PATIENT`, `DOCTOR`, `DONOR` and `HOSPITAL_ADMIN`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm test` | Run the unit and component tests (Vitest) |
| `npm run lint` | Lint with oxlint |

## Where things are

- `index.html` is the public landing page: static HTML built on the design kit in `public/assets` (no React). `app.html` is the React app. Vite serves `app.html` for every page route except `/`; a production host needs the same rewrite (serve `app.html` for any path that is not `/` and not a file).

- `src/features/<module>/` holds each module's screens, dialogs and form schemas, matching the backend modules.
- `src/api/types.ts` mirrors the Java DTOs. Keep the two in sync.
- `src/mock/server.ts` is the fake API used in mock mode. Its route table is the list of endpoints the backend needs to implement.
- `src/auth/RequireRole.tsx` hides screens from the wrong role. The backend must still check every request.
