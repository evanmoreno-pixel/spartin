# SpartIN final test report

## Scope and environment

Phase 4 ran on November 21, 2026 on Windows 11 Pro, Intel Core i5-14600K, 20 logical CPUs, 32,452 MiB RAM, Node.js 24.14.0, npm 11.9.0, SQLite 3.51.2, and Playwright 1.65.1. Test servers used temporary local files. The pre-existing development database was read for integrity and fingerprints. FR-01–FR-08, applicable non-functional requirements, migrations, release workflow, and local startup were in scope. The [traceability matrix](REQUIREMENTS-TRACEABILITY.md) maps original requirements to current evidence.

## Baseline before changes

| Check | Command or method | Actual outcome |
|---|---|---|
| Lockfile install | `npm ci --no-audit --no-fund` | Workspace attempt encountered a locked esbuild executable. The same command installed 293 packages in a new source-only temporary copy. Missing workspace dependency files were restored from that install without replacing the locked file. |
| Unit, component, integration | `npm test` | 68 passed, 0 failed, 0 skipped. |
| Production and static | `npm run build`, both project `tsc --noEmit` checks, and inspection of npm scripts/config | Passed. No standalone lint script or config was defined. |
| Edge and Chrome for Testing | Playwright full suite per Chromium channel | 8 passed in each, 0 failed, 0 skipped. |
| WebKit | `playwright test tests/browser/phase-3.spec.ts --browser=webkit` | 4 passed, 0 failed. Prior browser scenarios were outside this baseline WebKit selection. |
| SQLite | Read-only `PRAGMA quick_check`, `foreign_key_check`, and migration/row fingerprints | Versions 1–4 present, quick check ok, zero FK failures. The fixture regression suite also passed. |
| Startup | `npm start` at loopback port 3422 in the temporary copy | Served the built UI, signed in a demo account, and returned all five fresh seeded events. Initial `npm run dev` found port 5173 already occupied and exited with that diagnostic. |
| Security tooling | Full and production-only `npm audit --json` | Initial full tree returned 2 critical and 1 moderate dev-tool findings. Production dependency tree returned zero. |

## Final automated results

| Suite | Passed | Failed | Skipped or outside this run |
|---|---:|---:|---|
| Vitest, Supertest and React Testing Library | 78 | 0 | 0 |
| Edge 158.0.4370.33 | 10 | 0 | 0 |
| Chrome for Testing 159.0.8154.6 | 10 | 0 | 0 |
| Playwright WebKit 27.2 on Windows | 9 | 0 | The Chromium-only CDP touch regression was filtered out. It passed on Edge and Chrome. |

The Vitest total includes all 68 regressions plus 10 new test cases. The browser suite adds the release workflow and accessibility checks. The same scenarios run on multiple engines, so 29 browser passes are executions across three engines. The final lockfile installed in a separate empty copy and both production builds, both no-emit type checks, and the load script’s Node syntax check passed. After the proxy correction, the final combined unit suite and all supported browser cases were rerun.

### Reproduction commands

```powershell
npm ci --no-audit --no-fund
npm test
npm run build
node node_modules/typescript/bin/tsc -p backend/tsconfig.json --noEmit
node node_modules/typescript/bin/tsc -p frontend/tsconfig.json --noEmit
node --check scripts/load-test.mjs
npm audit
npm audit --omit=dev
```

With Playwright browsers installed, run the browser suites from the built checkout. Set `PLAYWRIGHT_BROWSERS_PATH` if the engines are installed in a custom cache.

```powershell
$env:SPARTIN_BROWSER_CHANNEL = 'msedge'
node node_modules/@playwright/test/cli.js test --output test-results/phase4-edge
$env:SPARTIN_BROWSER_CHANNEL = 'chromium'
node node_modules/@playwright/test/cli.js test --output test-results/phase4-chrome
Remove-Item Env:SPARTIN_BROWSER_CHANNEL
node node_modules/@playwright/test/cli.js test --browser=webkit --grep-invert 'touch enrollment' --output test-results/phase4-webkit
```

### Added cases and regression evidence

| ID or file | Tested behavior | Result |
|---|---|---|
| SEC-01–06, `backend/test/security.test.ts` | Same-origin writes, origin and Fetch Metadata rejection, malformed and oversized JSON, participant scope, headers, safe error logs, and login/logout through actual Vite proxy. | Passed |
| DB-01/02, `backend/test/migrations.test.ts` | Migration 4 on a simulated Phase 2 file with active waiters, repeated initialization, rollbacks, unique relationships and foreign keys. | Passed |
| CAL-01, `frontend/test/calendar-conformance.test.tsx` | Independent `ical.js` parsing of real spring-forward and repeated-hour fall-back timestamps, UTF-8 folding and escaping, stable UID and valid UTC. | Two cases passed |
| Prior API and component suites | Sessions, organizer CRUD, role and ownership checks, browsing, invalid transitions, capacity, restart persistence, cross-process contention, coordinates, sharing and GPS error handling. | 68 passed |
| Prior browser suites | Full CRUD, swipe pointer/keyboard/button paths, emulated touch in Chromium, repeat handling, maps, GPS network privacy, share/mapped clipboard paths, and calendar. | All available cases passed |
| SYS-01–04 and A11Y-01, `tests/browser/release.spec.ts` | End-to-end role switching, attendance changes, cleanup, and targeted accessibility and viewport checks. | Passed on all three engines |

### System workflow observations

| Step | Actual result |
|---|---|
| SYS-01. Sign in as Organizer 1, open Create event, enter an upcoming local schedule and venue, set capacity 1, enable the waitlist, and save. | Organizer session opened the form. Create succeeded. SQLite showed the configured capacity and waitlist flag. |
| SYS-01. Edit the title and description and reload. | The detail page displayed the edited title after reload and the database matched. |
| SYS-02. Sign in as Participant 1, find the event in Browse all, and open details. | The edited event was visible. Its campus map appeared, and its Directions link held the correct venue and omitted an origin parameter. |
| SYS-02. Copy the link and download ICS. | Chromium wrote the expected stable URL to the clipboard. WebKit used the manual fallback after injected clipboard denial. `ical.js` parsed the actual browser download. The participation table was unchanged before Join. |
| SYS-02. Join and open My events. | Join succeeded and My events showed Joined. |
| SYS-03. Sign in independently as Participants 2 and 3 and request a spot. | Each was waitlisted, in positions 1 and 2 respectively. Their My events views matched. |
| SYS-03. Participant 1 leaves. | Participant 2 became Joined. Participant 3 advanced to position 1. SQLite recorded one Joined, one Left, and one Waitlisted. |
| SYS-04. Organizer reloads, checks counts, and raises capacity to 2. | Counts were initially 1 Joined and 1 Waitlisted. After the change the final waiter became Joined, with 2 Joined and 0 Waitlisted. |
| SYS-04. Postpone and check access and reservations. | Shared details became unavailable to the participant. My events labelled the event Postponed and existing reservations were preserved. |
| SYS-04. Reschedule and restore Scheduled status. | Participant details and waitlist eligibility returned. Existing reservations remained consistent. Separate API tests confirmed promotion of a retained queue after reopening. |
| SYS-04. Delete the fixture event. | Organizer confirmation succeeded. The event disappeared from the participant detail route and its participation rows were cascaded out of SQLite. |

### Accessibility and interactive checks

A11Y-01 scanned participant discovery and the validated organizer form at 1280×800, 768×1024, and 390×844, plus the mobile Map view. Axe reported zero violations for the selected WCAG 2.0 and 2.1 A/AA rule tags on those screens in the tested browsers. The suite additionally checked horizontal overflow, a visible keyboard-focus outline, names of Join and Pass, keyboard operation, validation focus and associated error text, and the loading indicator with reduced motion.

The interactive Codex browser smoke used the clean Vite install. Participant and organizer sign-in worked through the proxy. The accessibility tree included the event card and its Join/Pass alternatives. Enter selected the library map marker and exposed the expected associated details and directions. Submitting the empty organizer form exposed the validation messages and moved focus to the Event title field. These were targeted accessibility checks, with no claim of full WCAG conformance or independent screen-reader certification.

### Startup, shutdown and data isolation

The clean source copy started with `npm run dev` on Vite port 5184 and API port 3423. Five demo users and five seeded events were available. A valid same-origin request through Vite signed in as Organizer 1 and created a disposable two-seat event. Ctrl+C stopped both development processes. The compiled server restarted on the same isolated SQLite file and returned the saved title and capacity after a new demo sign-in. Read-only comparison confirmed the original development database’s event, user, participation, and sequence fingerprints were unchanged. The release-visible file scan found no fixture database, test-output folder, or credential pattern hit.

## Defects and resolution

| ID | Severity | Observation, cause and resolution |
|---|---|---|
| PH4-01 | Critical (development tooling) | The baseline audit reported two critical and one moderate dependency findings. Updated Vitest to the registry-proposed fixed version, reran both audits and all regressions. Both final audit scopes reported zero. |
| PH4-02 | Medium | Route review found that API mutations relied on cookie site rules without explicit origin checks. Added same-origin and Fetch Metadata checks and SEC-01/02. |
| PH4-03 | Low | Unexpected errors logged raw path and exception text. Reduced the fallback log to safe fields and verified it with SEC-05. |
| PH4-04 | High for the local demo, resolved | When the origin check was introduced, the interactive Vite login returned a forbidden response. Vite’s shorthand rewrote the browser Host to the API port. The explicit proxy option now retains the browser Host. SEC-06 and the interactive demo proved successful sign-in through Vite. |
| PH4-05 | Setup friction, resolved | A running process occupied the default Vite port during the baseline smoke test. Added the `SPARTIN_WEB_PORT` override, kept the default, and exercised the documented development entry point on a free port. |

## Limits and release assessment

Ready for a local course demonstration with known limits. Actual Safari on Apple hardware, physical phone touch/GPS, a standalone screen reader audit, native share delivery, Google Maps turn-by-turn behavior, Google Calendar saving, and external calendar import were **Not Tested**. Browser permission and sharing paths used emulation or mocks as documented. The database and app test evidence supports the local release. Institutional identity, public deployment hardening, and NFR-04 no-show handling remain outside the audited demo scope. The isolated NFR-05 benchmark passed. [Performance report](PERFORMANCE-REPORT.md) · [Security review](SECURITY-REVIEW.md)
