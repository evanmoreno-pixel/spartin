# SpartIN Phase 1 implementation notes

## Architecture

The React and TypeScript presentation layer in `frontend/src` uses React Router for role-specific routes. Vite builds the client and proxies development API requests. Express routes in `backend/src/api` handle HTTP and authorization, `backend/src/services` implements session and event rules, and `backend/src/data` contains the SQLite migrations and parameterized queries. `shared/contracts.ts` defines the API data types.

SQLite uses Node’s built-in `node:sqlite` interface, which is experimental in Node 24. The migrations apply in a transaction and record their versions in `schema_migrations`. A separate seed migration creates three demo users and five campus events dated relative to first launch. Deleting an event does not reset the seed migration. The Users and Events tables are the only domain tables.

## Event data and availability

Title, location, start time, and end time are required. The end must be strictly later than the start. Description defaults to an empty string. Capacity accepts a nonnegative safe integer or `null` for no limit. An event can have zero capacity, since availability for browsing is independent of capacity. Status defaults to `scheduled`. Marking an event `postponed` hides it from participants and keeps its previous times so the organizer can revise its schedule.

The API accepts timestamps with seconds and an explicit UTC offset or `Z`, such as `2026-11-21T14:00:00-08:00`. SQLite and JSON responses use UTC ISO 8601 timestamps with milliseconds, such as `2026-11-21T22:00:00.000Z`. Browser inputs and displays use the viewer’s local timezone. Full dates display in `MM-DD-YYYY` format with 12-hour times. During a daylight-saving transition, nonexistent local times are rejected and ambiguous new times use the earlier offset. The API accepts an explicit offset to distinguish the two instances of an ambiguous time.

## REST API

JSON success responses use `{ "data": ... }`. List responses also return `pagination` with `page` and `hasNext`. Errors use `{ "error": { "code": "...", "message": "...", "fields": { ... } } }`, with `fields` included for field validation errors. Successful deletions return an empty response.

| Method and route | Access | Success |
|---|---|---|
| `GET /api/demo-accounts` | Any browser | 200, predefined account keys and display labels |
| `POST /api/session` | Any browser | 200, user and an HttpOnly, SameSite=Strict cookie. Body is `{ "accountKey": "organizer-1" }` with keys `organizer-1`, `organizer-2`, or `participant-1` |
| `GET /api/session` | Any demo session | 200, current user |
| `DELETE /api/session` | Any browser | 204, session invalidated and cookie cleared |
| `GET /api/events?page=1` | Any demo session | 200, scheduled events that have yet to end |
| `GET /api/events/:id` | Any demo session | 200, available event or an event owned by the signed-in organizer |
| `POST /api/events` | Organizer | 201, created event and its `Location` header |
| `PATCH /api/events/:id` | Event owner | 200, updated event |
| `DELETE /api/events/:id` | Event owner | 204, event deleted |
| `GET /api/organizer/events?page=1` | Organizer | 200, owned events across all statuses |

List routes default to page 1 and return up to 24 results per page, ordered by start time and event ID. Event JSON uses `eventId`, `organizerId`, `organizerDisplayName`, `title`, `description`, `startTime`, `endTime`, `location`, `capacity`, `status`, `createdAt`, and `updatedAt`. POST accepts editable fields only. PATCH accepts one or more editable fields and validates the resulting record. The server assigns the ID, owner, and audit timestamps.

The API uses 400 for invalid inputs, 401 for missing, invalid or expired sessions, 403 for forbidden organizer operations or non-owner writes, and 404 for missing or unavailable records. Demo sessions are held in process memory and clear on restart.

## Specification decisions

| Source | Phase 1 decision |
|---|---|
| PRD FR-02, SAD FR-02, SFDS Event Manager and schema | The PRD groups event inputs as fields organizers have the option to include. The SAD and SFDS call for required-field validation without identifying every mandatory field. Phase 1 requires the title, location, and chronological start/end times. Description is optional and blank capacity follows the SFDS convention of `null` for unlimited capacity. |
| SFDS event schema and the Phase 1 schema | Phase 1 uses `start_time` and `end_time` in place of separate event date and start time columns and adds explicit `scheduled` and `postponed` states. Created events receive UUIDs. Demo seed records use fixed text IDs. Deletion removes the row. Event images, waitlist configuration, and participation storage belong to later scope. |
| PRD date standard and TP date formatting example | The display follows the PRD’s `MM-DD-YYYY` format and uses the TP’s 12-hour clock. Native date-input controls follow the browser’s locale. |
| PRD, SAD, SFDS, PP and TP institutional identity assumptions | The Phase 1 prompt specifies simulated demo accounts. The session is managed on the server. Institutional sign-in, university credentials, and Duo are outside Phase 1. |
| PRD FR-01, FR-03 through FR-10 and broader project scope | Phase 1 delivers FR-03 browsing and detail views. Join and Pass are planned for Phase 2. Swipe actions, maps, sharing, location, waitlist, calendars, recommendations, and SMS reminders are outside this delivery. |
| PP, SFDS and TP proposed tooling and storage | The prompt resolves the pending choices to React/Vite, Express, TypeScript, SQLite, Vitest, Supertest, and React Testing Library. Playwright exercises the browser workflow described by the PP and TP. |
| TP coverage table and sample cases | TC-004 in the TP’s sample tests describes Event CRUD. The coverage table also lists TC-010–TC-013 for FR-02 without their complete procedures. TC-002 remains the original CSV export example. Phase 1 links implemented requirements directly to executable tests below. |

## Requirements traceability

| Requirement | Design reference | Executable evidence |
|---|---|---|
| FR-02 | SAD UC-03, UC-04, VAL-02. SFDS Event Manager and Organizer Create / Update Event. TP TC-004. | Supertest checks ownership, CRUD, rescheduling, postponement, and reopen persistence. Playwright exercises those operations through the built UI, API, and a SQLite file. |
| FR-03, browsing portion | SAD UC-01 and browsing portion of VAL-01. SFDS Event Discovery. | API, React Testing Library, and Playwright checks cover catalog and details, including visibility after updates, postponement, and deletion. |
| NFR-01 | SAD 6.1 and SFDS validation. | API and component tests check field errors, rejected dates or capacity, and preservation of stored values after a failed update. |
| NFR-02, NFR-07 | SAD VAL-08 and SFDS authorization. | API tests cover missing, forged, expired, participant, and non-owner access. Browser and component tests check role-specific routes. |
| NFR-03, Phase 1 data | PRD privacy and SAD security requirements. | The demo user schema stores only identifier, display name, and role. |
| NFR-05, NFR-06 | SAD VAL-07 and TP acceptance criteria. | Formal load acceptance and the full Chrome/Safari compatibility matrix remain outside Phase 1 verification. |

## Verification results

Run on November 21, 2026 with Windows, Node.js 24.14 and Microsoft Edge.

| Check | Result |
|---|---|
| TypeScript and Vite build | Passed for the backend and frontend. |
| Vitest, Supertest and React Testing Library | 30 passed. The restart check closed and reopened a SQLite file and verified both a saved edit and a deleted seed. |
| Playwright in Edge | 1 passed. Desktop organizer and mobile-width participant sessions exercised the UI, Express API and SQLite file, including deletion confirmation and participant refresh. |
| Vite development startup | The frontend loaded and the proxy handled a demo sign-in and returned all five seeded events. |
