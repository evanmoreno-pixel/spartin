# SpartIN Phase 4 security and privacy review

## Scope and result

Reviewed the loopback-only demo’s Express routes, session store, event and participation services, SQLite statements, React rendering, map requests, sharing payloads, and npm lockfile. Automated checks used temporary local data. The current lockfile returned zero findings in the full and production-only npm audits. The application remains scoped to a local course demonstration with simulated accounts.

## Findings and corrections

| Finding | Severity | Evidence | Disposition |
|---|---|---|---|
| Advisory findings in Vitest and its development dependencies | Critical ×2, Moderate ×1 | The initial full npm audit classified `vitest` and `tinypool` as critical and `@vitest/mocker` as moderate. The production-only tree returned zero. | Upgraded Vitest 3.2.7 to 5.1.1, keeping Vite 7.3.8. The final `npm audit --json` and `npm audit --omit=dev --json` returned zero. All baseline and added tests passed. |
| Missing explicit origin isolation on cookie-authenticated writes | Medium | Source review found reliance on SameSite alone. Same-site browser context and same-origin browser context are distinct. | State-changing routes now require a supplied Origin to match the app and reject Fetch Metadata marked same-site or cross-site. SEC-01 and SEC-02 passed. SEC-06 and the interactive smoke check proved valid same-origin operations still work through Vite. [W3C Fetch Metadata](https://www.w3.org/TR/fetch-metadata/) |
| Internal error logs included raw paths and driver messages | Low | Source review found request path and exception text in the generic error handler. | Unexpected errors log only timestamp, request method, and a fixed event code. SEC-05 passed for both the response and the log emitted by a deliberately unavailable fixture database. |

## Defensive checks

| Area | Evidence and outcome |
|---|---|
| Session lifecycle | 32 cryptographically random bytes form the opaque cookie token. The cookie is HttpOnly, SameSite=Strict, and scoped to `/api`. Selection rotates tokens and logout removes them. Expired, missing, and invalid sessions are rejected. Tests cover lifecycle and exclusivity. |
| Authorization and record scope | Database roles gate organizer and participant actions. Organizer mutations verify the owner. Participation operations use the caller’s session identity and ignore unrelated identity parameters. SEC-04 checks that another participant’s records remain untouched. |
| Input and data access | Express enforces a 48 KiB limit for JSON routes and rejects malformed bodies. Validation covers the shape, dates, fields, status, capacity and location. The data layers bind values to SQL parameters. SQL fragments for known filters are selected internally and contain no input fragments. FK, uniqueness and rollback regressions passed. |
| Rendering and content | Event and organizer content renders as React text or DOM attributes. Leaflet marker HTML uses a constant or a numeric group size. Map and calendar URLs use fixed origins and encoded parameters. There are no permissive CORS headers. API responses use no-store and the app uses nosniff. |
| Privacy and unexpected errors | Shared links include the application origin and event ID. They omit the session token and participant identity. Precise device coordinates stay in browser memory, and stop/unmount removes them. Browser network assertions verified that the map pauses tile requests while position is displayed. The fixture showed no GPS writes or event data changes. |
| Package and file integrity | Full and production-only npm audit checked the final lockfile. Local release file review checked for dependency folders, development databases, test output, env files, private keys and obvious secret patterns. |

## Residual risks

- **High if exposed beyond loopback.** Demo roles are intentionally selectable without credentials. Local HTTP omits the Secure cookie attribute and TLS. Sessions are in memory and disappear on restart. These are boundaries of the course demo.
- **Medium for a public deployment.** Public abuse protections, rate limiting, a restrictive production CSP, and production threat modeling remain outside this release. Non-browser clients that send no Origin or Fetch Metadata still need a valid session for protected actions.
- **Low privacy exposure from maps.** OpenStreetMap receives the viewport tile coordinates, IP, origin referrer and browser request metadata for ordinary tile requests. Google can receive the event destination upon a directions click. SpartIN supplies no user coordinates to either service. The browser or operating system can use its own location providers when granted permission. [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/)
- Browser tests used emulated coordinates and instrumented share paths. They do not measure a physical phone’s location-provider traffic.
