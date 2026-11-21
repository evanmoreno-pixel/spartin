# SpartIN

SpartIN is the CMPE 131 campus events web app for San José State University transfer students. Phase 3 adds event maps and directions (**FR-04**), shareable event links (**FR-05**), opt-in location (**FR-06**), and calendar export (**FR-08**). Organizers can manage events (**FR-02**) and participants can browse, swipe, join, pass, and leave events with FIFO waitlisting (**FR-01**, **FR-03**, **FR-07**).

## Run locally

Use Node.js 24 LTS (24.12 or later) and npm. From the project root, run:

```sh
npm ci
npm run dev
```

Open [SpartIN in your browser](http://127.0.0.1:5173). Vite proxies requests to the Express API listening on port 3000. To serve the built frontend and API together at [port 3000](http://127.0.0.1:3000), run:

```sh
npm run build
npm start
```

SQLite creates `backend/data/spartin.sqlite` on first launch and applies pending schema migrations at startup. Existing files upgrade in place. Event and participation changes persist after restart. Set `SPARTIN_DB` to use a different file, or set `PORT` to change the API port.

If the default ports are occupied, set `SPARTIN_WEB_PORT` for Vite and `PORT` for the API before running `npm run dev`. For example, in PowerShell:

```powershell
$env:SPARTIN_WEB_PORT = '5184'
$env:PORT = '3423'
npm run dev
```

## Demo accounts

**Authentication is simulated and unsuitable for production deployment.** The app listens on the local loopback interface. Anyone with access to the demo can choose any of its predefined accounts. The server issues an opaque session cookie and resolves the role from the stored user record on each protected request. Sessions expire after eight hours or when the server restarts.

- **Organizer 1** and **Organizer 2** can manage their own events, set capacity, and enable waitlist enrollment. The event detail view shows the number joined and waitlisted.
- **Participant 1**, **Participant 2**, and **Participant 3** can use **Discover**, **Browse all**, **Map**, and **My events**. Drag or swipe right to join and left to pass. The focused deck also accepts the right and left arrow keys. Buttons provide the same actions. Use **My events** to review enrollment, see waitlist position, or leave.

## Demonstrate maps, sharing, and calendar

1. Sign in as **Participant 1** and choose **Map**. Select **Library Study Jam** on its pin to see the event summary, then open **View event details**. **Directions** opens Google Maps. If the original demo events have ended, create a future event at the **Dr. Martin Luther King, Jr. Library** or enter verified coordinates under **Map pin (optional)**.
2. On **Map**, select **Use my location**, then grant or deny the browser request. **Stop using my location** removes its marker. Location requires a secure context such as HTTPS or loopback. A plain HTTP LAN address on a phone may be unable to request it.
3. On event details, use **Share event** or **Copy link**. If automatic access is unavailable, copy from the displayed link field. A recipient who can reach the same origin can open the corresponding event after selecting a demo account. A loopback link is local to the device serving the application.
4. Select **Add to Google Calendar** and review the draft before saving, or select **Download calendar file** and import the `.ics` into a compatible calendar.

Leaflet displays street tiles from OpenStreetMap with visible attribution. If tiles are unavailable or paused while your location is displayed, event pins and the text location list remain available. The app keeps your location in browser memory and clears it when you stop using location or leave the map.

## Demonstrate a waitlist

1. As **Organizer 1**, create an upcoming event with capacity **1** and select **Allow waitlist enrollment when full**.
2. Switch to **Participant 1**, find the event in **Browse all**, open its details, and select **Join**.
3. Switch to **Participant 2**, open the same event, and select **Join waitlist**. Under **My events**, confirm position **1**.
4. Repeat with **Participant 3** and confirm position **2**.
5. Switch back to **Participant 1**. In **My events**, select **Leave event**. Participant 2 now shows **Joined** and Participant 3 moves to position **1**. Use separate browser profiles to keep the demo accounts signed in simultaneously.

## Test

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run test:load
```

The browser suite builds the app, runs the real API against temporary SQLite files, and exercises the full release workflow and targeted accessibility checks. To use an installed Microsoft Edge browser, set `SPARTIN_BROWSER_CHANNEL=msedge` before running `npm run test:e2e`. The load test starts its own loopback server with synthetic accounts and a disposable database.

## Release evidence

See the [Phase 4 summary](docs/PHASE-4.md), [release checklist](docs/RELEASE-CHECKLIST.md), and [final test report](docs/FINAL-TEST-REPORT.md). The earlier delivery records are in [Phase 1](docs/PHASE-1.md), [Phase 2](docs/PHASE-2.md), and [Phase 3](docs/PHASE-3.md).
