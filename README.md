# SpartIN

SpartIN is the CMPE 131 campus events web app for San José State University transfer students. Phase 1 implements **FR-02** organizer event management and the browsing portion of **FR-03**.

## Run locally

Use Node.js 24.12 or later and npm. From the project root, run:

```sh
npm ci
npm run dev
```

Open [SpartIN in your browser](http://127.0.0.1:5173). Vite proxies requests to the Express API listening on port 3000. To serve the built frontend and API together at [port 3000](http://127.0.0.1:3000), run:

```sh
npm run build
npm start
```

SQLite creates `backend/data/spartin.sqlite` on first launch and applies the schema and demo seeds once. Event changes persist after restart. Set `SPARTIN_DB` to use a different file, or set `PORT` to change the API port.

## Demo accounts

**Authentication is simulated and unsuitable for production deployment.** The app listens on the local loopback interface. Anyone with access to the demo can choose any of its predefined accounts. The server issues an opaque session cookie and resolves the role from the stored user record on each protected request. Sessions expire after eight hours or when the server restarts.

- **Organizer 1** and **Organizer 2** can create, view, edit, reschedule, postpone, and delete their own events. Use **Edit or reschedule** to change the dates, or set the status to **Postponed** to hide the event until it is scheduled again.
- **Participant 1** can browse and open scheduled events that have yet to end. The catalog and open details refresh when the tab becomes active and every 15 seconds while visible. The catalog also has a **Refresh** button.

To demonstrate the complete workflow, create a future event as Organizer 1, switch to Participant 1 to see it, then return to Organizer 1 to edit or delete it. The two roles can also stay signed in simultaneously in independent browser profiles or a regular and private window.

## Test

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

The browser test builds the app, runs the real API against a temporary SQLite file, and checks the organizer and participant workflows at desktop and mobile viewport sizes. To use an installed Microsoft Edge browser, set `SPARTIN_BROWSER_CHANNEL=msedge` in your shell before running `npm run test:e2e`.

See the [Phase 1 implementation notes](docs/PHASE-1.md) for the API contract, specification decisions, and requirements traceability.
