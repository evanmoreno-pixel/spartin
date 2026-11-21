# SpartIN Phase 2 implementation notes

## Scope and traceability

| Requirement | Delivered | Verification |
|---|---|---|
| FR-01 | A discovery deck supports left/right swipes, desktop mouse drag, touch, arrow keys, Join and Pass buttons, and links to the existing detail view. | Playwright checks pointer, touch, keyboard, and buttons against real API writes. It also verifies that failure keeps the same card and pending writes block repeat input. SAD UC-01 and VAL-01, SFDS Event Discovery / Swipe Flow. |
| FR-03 | Participants persistently join, pass, leave, and view their own participation and position. | Supertest checks authorization, duplicate actions, transitions, discovery filtering, and persistence. Playwright checks attendance and waiting from My events. SAD UC-02 and VAL-01, SFDS Join Event / Capacity Check. |
| FR-07 | Organizer-controlled enrollment, capacity enforcement, FIFO promotion, and position updates. | Supertest covers zero, finite and unlimited capacity, simultaneous joins, retries, closing enrollment, and organizer capacity changes. Playwright exercises FIFO promotion across three accounts. SAD UC-07 and VAL-04, TP TC-003. |
| FR-02 | Phase 1 CRUD, detail, rescheduling, postponement, and deletion remain available. The organizer can also configure and inspect the waitlist. | Phase 1 regressions and the organizer browser workflow. |
| NFR-01, NFR-02, NFR-03, NFR-07 | Server-side field validation, role and ownership checks, protected sessions, and personal participation status limited to the signed-in participant. | API status and authorization tests. Public event responses expose aggregate counts and organizer display names. |

The Phase 1 baseline matched the repository’s README and Phase 1 notes. Participant browsing was read-only, the demo featured one participant account, and SQLite had Users and Events with a version-2 seed marker. The broader SAD and SFDS described participation and waitlist behavior that Phase 1 deferred. The TP’s sample TC-003 describes waitlisting, while its coverage matrix lists additional case IDs without full procedures. This document links verification to executable tests and preserves the specification identifiers.

## Database migration

Migration **3** adds `events.waitlist_enabled` (SQLite boolean, default false), the `participation` table, a persistent `waitlist_sequence` counter, and `demo_seed_history`. Participation has a UUID primary key, user and event foreign keys, a unique user/event pair, created and updated UTC timestamps, a checked status, and a unique FIFO order required only for waitlisted rows. Indexes cover event/status/order and user/status/event. Organizer deletion cascades only to participation for that event.

Startup applies the pending migrations in a SQLite transaction. Existing Phase 1 databases retain versions 1 and 2 and append version 3. Fresh databases record schema versions 1 and 3 and track seed history separately. The legacy version-2 marker prevents Phase 1 data from being seeded again after upgrade. Separate seed code adds demo Participants 2 and 3 once, preserves existing accounts and events, and leaves deleted seed events deleted.

## State transitions

| Action | Starting state | Result |
|---|---|---|
| Join | No record, Passed, or Left | Joined if space is available. Waitlisted if the event is full and enrollment is enabled. Otherwise `FULL` with no state change. |
| Join | Joined or Waitlisted | Existing record returned as `ALREADY_JOINED` or `WAITLISTED`. A waiting retry keeps its FIFO order. |
| Pass | No record, Left, or Passed | Passed. Repeating Pass keeps the current record. |
| Pass | Joined or Waitlisted | `LEAVE_REQUIRED`. The participant keeps their spot or position. |
| Leave | Joined, Waitlisted, or Left | Left. A joined departure releases a seat. A waiter departure leaves the queue. Repeating Leave on Left has no further effect. |
| Leave | No record or Passed | `NOT_PARTICIPATING`. |
| Promotion | Waitlisted | Joined in FIFO order with the waitlist position cleared. |

Join and Pass require a scheduled event whose end time is still in the future. This keeps the Phase 1 visibility rule for ongoing events. The Phase 1 statuses are Scheduled and Postponed. A deleted event returns 404. Joined or waitlisted users can still leave a postponed or ended event from **My events**. A passed event stays out of **Discover** and remains accessible in **Browse all** if it is scheduled and has yet to end. An explicit Join from its detail page can change the saved choice. Leaving makes a still-available event eligible for discovery again.

## Capacity and waitlist

- Only Joined records reserve seats. A capacity of zero permits zero joins. A blank capacity remains unlimited.
- Every capacity-sensitive write starts with `BEGIN IMMEDIATE` before it evaluates availability or participation. Independent server processes acquire the same SQLite file lock before comparing the joined count and writing. The database enforces a single user/event row as an additional safeguard.
- On enrollment, the transaction increments the persistent counter and saves its value on the Waitlisted row. Sequence order reflects serialized enrollment transactions. Active position is computed by counting earlier and current active waiters. A participant who leaves and queues again goes to the back.
- A joined departure or an organizer’s capacity increase fills free seats from the oldest active waiters in the same transaction. Changing to unlimited promotes all active waiters. A reduction below the current joined count is rejected.
- Closing waitlist enrollment stops new waiters and preserves existing positions. Postponement pauses promotions while retaining registrations. Restoring an eligible schedule fills available seats from the existing queue.

## API contract

All routes below require a valid Participant demo session. Write requests have no payload. They act on the user from the session. Successful responses use the existing `{ "data": ... }` envelope.

| Route | Response |
|---|---|
| `GET /api/events/discovery?page=1` | Eligible discovery events, ordered by start time and event ID. Excludes your Joined, Waitlisted, and Passed events. |
| `POST /api/events/:id/join` | 200 with `JOINED`, `ALREADY_JOINED`, or `WAITLISTED`. A full event with closed enrollment returns 409 with error code `FULL`. |
| `POST /api/events/:id/pass` | 200 with `PASSED`, or 409 `LEAVE_REQUIRED` for active participation. |
| `POST /api/events/:id/leave` | 200 with `LEFT`, or 409 `NOT_PARTICIPATING` if the participant has no active or left record. |
| `GET /api/me/participation?page=1` | Joined and Waitlisted events with the caller’s `participation` status. |
| `GET /api/events/:id/participation` | The caller’s `status` and one-based `waitlistPosition`. Fields are null when they do not apply. |

Write response data contains `outcome`, `status`, and `waitlistPosition`. Postponed and ended events return 409 `EVENT_UNAVAILABLE` for Join and Pass. Existing conventions apply for invalid IDs or pages (400), missing or expired sessions (401), wrong role (403), and missing event (404). Lists default to page 1 and retain the Phase 1 maximum of 24 results. Existing event JSON adds `waitlistEnabled`, `joinedCount`, and `waitlistedCount`. Participant event details also include the caller’s `participation`. Organizer create and patch accept the optional boolean `waitlistEnabled`. An organizer capacity change can return 409 `CAPACITY_BELOW_JOINED` with a capacity field error.

## Frontend

- `ParticipantDiscovery.tsx` adds the participant navigation and deck. Pointer gestures preserve vertical scrolling, and card links remain keyboard-accessible. Join and Pass use the same mutation for every input method. The deck keeps the current card after an error and advances after success.
- `Participation.tsx` shares action handling, displayed outcomes, and accessible controls with the event details page. `MyEvents.tsx` shows joined and waitlisted events with Leave controls.
- The existing browse catalog is available at `/participant/browse`, and `/participant/my-events` opens the participant’s personal list. Views use the existing visibility, focus, and 15-second refresh behavior.
- The organizer form adds a waitlist toggle and current counts. The existing detail view shows maximum capacity, Joined and Waitlisted counts, and enrollment state.

## Specification differences and limitations

- SAD UC-07 mentions a possible maximum queue size. The SFDS schema specifies a waitlist toggle, and Phase 2 implements the toggle and an uncapped FIFO queue.
- The SFDS permits local Passed state. Phase 2 persists it per account. The SAD/PRD mention additional cancellation or no-show behavior. Phase 2 retains the existing Postponed and hard-delete model and promotes after explicit departure or restored capacity. No-show attendance tracking is outside this delivery.
- Authentication uses local simulated accounts. Phase 2 keeps the in-memory session lifetime and adds two identities for demonstrating the queue. The organizer and participant roles remain exclusive.
- FIFO order is based on SQLite transaction acquisition for competing requests. Status changes appear on refresh or polling. The demo has no push notifications.
- The load verification here exercises capacity races. The PRD’s NFR-05 acceptance load and the full NFR-06 browser/device matrix require separate execution.

## Verification results

Executed November 21, 2026 on Windows with Node.js 24.14.

| Check | Result |
|---|---|
| Phase 1 baseline before changes | 30 API and component tests passed. |
| Combined API and component tests | 42 passed, including all 30 Phase 1 regressions and 12 Phase 2 tests. The new tests exercise migration of a legacy file, a restart with saved participation, FIFO position changes, and separate Express server processes racing for the last seat on the same SQLite file. |
| Backend and frontend build | TypeScript compilation and Vite production build passed. |
| Combined Playwright suite | 4 passed in Microsoft Edge, including one Phase 1 CRUD regression and three Phase 2 scenarios. Coverage includes mouse drags in both directions, keyboard and button actions, touch swipes in both directions at a 390-pixel mobile viewport, repeat-input blocking, a failed join, and FIFO promotion across three accounts. |
| Existing development database | Migration versions 1, 2, and 3 are present. The four existing events remain, the three existing accounts remain, and two demo participants were added. SQLite reported zero foreign-key violations. A separate fixture test verified legacy row values and that previously deleted seed events stayed deleted. |
| Original project documents | Checksums for PRD, SAD, SFDS, PP, and TP match the originals. |

The final runs had zero failed or skipped tests. An earlier Edge run exposed touch capture transferring from a card child to the swipe surface. The gesture handler now ignores the child’s capture-loss event, and both touch directions passed on the final run. Physical phones and Safari/WebKit were outside the tested environment. The Edge mobile run used browser-emulated touch input.

## Files changed

| Area | Added | Modified |
|---|---|---|
| Backend | `data/demoSeeds.ts`, `data/participationRepository.ts`, `services/participationService.ts` | `data/database.ts`, `data/eventRepository.ts`, `services/demoSessions.ts`, `services/eventService.ts`, `services/eventValidation.ts`, `api/routes.ts`, `app.ts` under `backend/src` |
| Frontend | `MyEvents.tsx`, `ParticipantDiscovery.tsx`, `Participation.tsx` | `App.tsx`, `EventDashboard.tsx`, `EventDetail.tsx`, `EventEditor.tsx`, `api.ts`, `styles.css` under `frontend/src` |
| Contracts | | `shared/contracts.ts` |
| Tests | `backend/test/participation.test.ts`, `backend/test/fixtures/participationServer.ts` | `backend/test/events.test.ts`, `frontend/test/app.test.tsx`, `tests/browser/event-workflow.spec.ts` |
| Documentation | `docs/PHASE-2.md` | `README.md` |
