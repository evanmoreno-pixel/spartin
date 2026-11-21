# SpartIN local release checklist

**Decision: Ready for the CMPE 131 course demonstration with known limitations.** Use a loopback server and the built-in demo accounts.

## Verified release gates

- [x] A source-only temporary copy installed the exact npm lockfile and built the client and server. Backend and frontend TypeScript checks passed.
- [x] 78 API and component tests passed, including the 68 baseline tests. Browser passes were 10 in Edge, 10 in Chrome for Testing, and nine in Playwright WebKit. The WebKit run excludes the Chromium-only touch test.
- [x] Organizer CRUD, participant discovery and attendance, FIFO promotions, and deletion cleanup passed in the same browser scenario.
- [x] Fresh SQLite initialization, Phase 1 and Phase 2 upgrade fixtures, persistence, rollback, uniqueness, and concurrent writes passed. The development database was checked read-only.
- [x] The mixed NFR-05 benchmark passed with 100 virtual users and 1,007 events. All 8,069 mixed requests completed within two seconds.
- [x] The final npm audit reported zero advisories. The scoped origin, authentication, authorization, input, and privacy checks passed.
- [x] Verified demo sign-in and create through Vite from the clean installation. The browser preview checked map selection, visible controls and organizer form feedback. The saved event survived Ctrl+C and a compiled-server restart on the same isolated database.
- [x] Source and tracked-file checks found no private keys, secret files, or tracked SQLite databases. Test fixtures and result output stay outside the release source.
- [x] The five original specifications and historical phase reports remain in place. Verification scope and unresolved items are linked below.

## Run the demonstration

1. Use Node.js 24 LTS, at least 24.12. In the project folder, run `npm ci` and `npm run dev`. Open [the default local app](http://127.0.0.1:5173). If a port is occupied, the README explains the two port overrides.
2. Sign in as **Organizer 1**. Create a future campus event with capacity **1** and waitlisting enabled. Open its details and edit the title.
3. Sign in as **Participant 1**, find the event in **Browse all**, and open it. Check the map or text location, copy its link, and download the calendar file. Select **Join**.
4. In **Participant 2** and **Participant 3** sessions, join the waitlist and confirm positions 1 and 2. Return to Participant 1 and select **Leave event** from **My events**. Verify Participant 2 is Joined and Participant 3 is first in line.
5. As Organizer 1, confirm the counts and raise capacity to 2. Verify promotion, postpone and reschedule the event, then delete the demonstration fixture if it is disposable.
6. Stop the local server with Ctrl+C. SQLite preserves saved data. Restarting requires a new demo sign-in.

## Known limits

- Safari on Apple hardware, physical phone touch/GPS, standalone screen readers, native share delivery, and saving to an external calendar account are **Not Tested**. A11Y-01 is a targeted scan and keyboard check, with no full conformance claim.
- Street tiles require connectivity. The Map shows a text and directions fallback if tiles fail. GPS is optional and browser-mediated.
- Demo authentication is simulated. Real university identity, public deployment hardening, suggestions, SMS, and automatic no-show detection are outside this release.

[Setup and demo walkthrough](../README.md) · [Final test report](FINAL-TEST-REPORT.md) · [Requirements traceability](REQUIREMENTS-TRACEABILITY.md) · [Performance report](PERFORMANCE-REPORT.md) · [Security review](SECURITY-REVIEW.md)
