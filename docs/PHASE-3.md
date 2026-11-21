# SpartIN Phase 3 implementation notes

## Requirements and status

| Requirement or capability | Status | Evidence |
|---|---|---|
| FR-04 event map and navigation | Implemented and tested | Campus and organizer-supplied off-campus pins, event selection, participant detail maps, destination URLs, and a fallback when street tiles fail. SAD UC-05 and VAL-03. TP TC-016 and TC-027. |
| FR-05 shareable event links | Implemented and tested | Web Share API paths, explicit Copy Link, manual selection on failure, and event links that survive demo sign-in. SAD UC-06 and VAL-05. TP TC-018 and TC-027. |
| FR-06 approximate user location | Implemented and tested | Explicit consent control, reported accuracy radius, position removal, error states, and browser-emulated network and SQLite privacy checks. SAD VAL-03. TP TC-017. |
| FR-08 calendar handoff and export | Implemented and tested | A populated Google Calendar draft URL, a downloaded iCalendar file, UTC conversion, validation, and no participation changes. SAD UC-06 and VAL-05. TP TC-019 and TC-027. |
| Native share target and external calendar interoperability | Implemented but not independently verified | Browser handoffs and export content were verified. Saving in a Google account, importing into Apple Calendar, and delivery to a native share target were outside the test setup. |
| Demo identity | Simulated | Existing local accounts and server sessions continue to guard role-specific operations. |
| FR-09 and FR-10 | Deferred | Recommendations and SMS reminders are outside Phase 3. |

The baseline passed 42 API and component tests and four Edge browser tests before changes. Phase 1 and Phase 2 stored venue names and free-text locations but had no coordinate columns or browser integrations. The originals describe a Google Maps API adapter and a native or in-app calendar UI. Phase 3 uses an attributed Leaflet map, a Google Maps Directions URL, the browser share sheet, and calendar drafts and files. The requested calendar handoff covers FR-08. A full in-app calendar is outside this delivery. Existing identifiers and the historical test documents remain unchanged.

## Database and API

Migration **4** adds nullable REAL `events.latitude` and `events.longitude` columns with range and pair constraints. It keeps the existing location text and leaves the new fields empty for every prior row. Users, participation, waitlist settings, FIFO order, and existing migration markers are preserved.

The existing event routes return `coordinates: null` or `coordinates: { latitude, longitude }`. Create and owner PATCH accept the optional object. Both values must be finite numbers within −90 to 90 latitude and −180 to 180 longitude. An explicit null clears the pin. An address change without a replacement clears the old pin. Other edits preserve it. There are no new backend endpoints or external-service proxies.

## Map provider and location data

Leaflet 1.9.4 renders event locations with standard OpenStreetMap tiles requested directly by the browser. The map shows the OpenStreetMap copyright link, uses the normal browser cache and origin referrer, and loads tiles for the visible viewport. Leaflet is loaded only when a map is needed. No tiles are staged for offline use, and the participant map uses one page of the existing event API at a time. A failed tile request drops the street layer and keeps pins, zoom, event selection, the address list, and directions. [Leaflet reference](https://leafletjs.com/reference) · [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) · [OpenStreetMap copyright](https://www.openstreetmap.org/copyright)

The exact campus aliases for Diaz Compean Student Union, Student Union Room 1200, and Dr. Martin Luther King, Jr. Library display approximate building-level points derived from public OpenStreetMap footprints. Room details remain in the text. The known-venue lookup happens in the browser and never writes coordinates to old events. Other place names and street addresses stay text-only unless their organizer supplies reliable coordinates. A named location is never sent to a geocoding API. [SJSU campus map](https://www.sjsu.edu/map/) · [Student Union geometry](https://api.openstreetmap.org/api/0.6/way/25774831/full.json) · [Library geometry](https://api.openstreetmap.org/api/0.6/way/25774796/full.json) · [Campus geometry](https://api.openstreetmap.org/api/0.6/way/25775883/full.json)

Multiple events at the same coordinates share a marker and selectable event summaries. Directions use organizer-provided coordinates, a verified campus venue name, or the original location text. The external link includes the destination only. Google may resolve text differently depending on how specific the venue or address is. Empty destinations or links above Google’s URL limit show an unavailable message. The street projection covers roughly 85 degrees on either side of the equator. Locations outside that range can use the directions handoff. [Google Maps URL documentation](https://developers.google.com/maps/documentation/urls/get-started)

## Geolocation permissions and privacy

**Use my location** makes a one-shot browser request with a ten-second acquisition timeout. The app displays the device-reported accuracy radius. **Stop using my location** also ignores any pending response. Leaving the map clears the position. Denial, unavailable services, unsupported contexts, and timeouts have separate feedback. No browsing or participation action relies on permission.

The position remains in the map component’s memory. SpartIN never sends it to its API, SQLite, logs, Directions, or tile services. The street tile layer is removed before fitting a viewport around the position. It is restored after the view returns to the event area. HTTPS or loopback is required, subject to the browser’s own permissions. [W3C Geolocation specification](https://www.w3.org/TR/geolocation/)

## Sharing behavior

The stable route is `/events/:id`. It preserves the pathname through demo sign-in and checks the event through the existing protected API. The link contains the current origin and event ID. The share payload contains only the title and that URL. Browser cancellation is quiet. Unsupported or denied sharing exposes a selectable link. Copy confirmation appears only after the clipboard write succeeds. Loopback links work on the device serving that address. Recipients elsewhere need a separately reachable origin. [Web Share API](https://www.w3.org/TR/web-share/) · [Clipboard API](https://www.w3.org/TR/clipboard-apis/)

## Calendar and timezones

Both formats export the title, description, location, start time, and end time. Google Calendar receives a prefilled draft via a URL. The user confirms the save in Google Calendar. The iCalendar file uses a stable event UID, an export timestamp, UTC date-time values, CRLF line endings, escaped text, and UTF-8 folding at 75 octets. The existing UI still displays local time. The event model requires both start and end. If either is invalid or their UTC times coincide at calendar seconds precision, both exports are unavailable and the user sees guidance. Exporting does not alter participation. [Google Calendar draft URLs](https://developers.google.com/workspace/calendar/api/concepts/inviting-attendees-to-events) · [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545/)

## Verification results

Executed November 21, 2026 on Windows with Node.js 24.14.

| Check | Actual result |
|---|---|
| Existing app baseline | Build passed, 42 API and component tests passed, and four Edge browser tests passed. |
| Final TypeScript and Vite build | Passed. Leaflet is bundled separately and loaded on demand. |
| Final Vitest, Supertest, and React Testing Library | **68 passed**. All 42 Phase 1 and Phase 2 regressions and 26 Phase 3 tests passed. The regressions include CRUD, demo sessions, discovery, swipe participation, duplicate prevention, capacity races across SQLite connections, and FIFO promotion. |
| Edge | **8 passed**. Four existing browser regressions and all four Phase 3 scenarios. Native Clipboard API copying and reading were verified in the test context. |
| Chrome for Testing | **8 passed**. The same regression and integration scenarios, with native Clipboard API copying verified. |
| Playwright WebKit on Windows | **4 passed**. All Phase 3 integration scenarios. Share and manual link fallback were verified. The Chromium-specific clipboard readback assertion and prior-phase CDP touch regressions were outside this run. |
| Interactive local browser preview | Live OpenStreetMap tiles loaded on the map and detail page. Selecting the library marker opened the correct event, and its Directions and Google Calendar links showed the expected destinations. The browser resolved the Share request. |
| SQLite migration | Development database upgraded to version 4. Hashes of the four existing events, five users, three participation records, and the FIFO counter matched their pre-migration values. Existing coordinate fields stayed null. Foreign-key check passed. |
| Original project specifications | PRD, SAD, SFDS, PP, and TP checksums match their pre-change values. |

The final suites had zero failed tests. The browser suite exercised desktop and 390-pixel mobile viewports, emulated geolocation success, denied permission, tile outage and recovery, native download, and a Google Calendar draft handoff intercepted before any external save. Unit tests exercised unavailable and timed-out browser location, clipboard failure, and share cancellation. A first integration run exposed a stale Leaflet listener after tile failure. The fix passed on all three engines, including a targeted rerun that verified switching from working street tiles to the private location view and back.

## Known limits and unverified environments

- **Not Tested** on physical phones, including iPhone GPS, or the installed Safari product. Playwright WebKit ran on Windows with an emulated mobile viewport. Native share delivery, turn-by-turn routing, and importing or saving in an external calendar account were also outside verification.
- Map tiles are best-effort. The fallback keeps the geographic pin view and event list on screen when street tiles are unavailable.
- Shared links rely on the recipient’s ability to reach the original app origin. Demo authentication remains local and simulated.
- The formal NFR-05 load test and full NFR-06 device matrix remain outside the executed checks.

## Files changed

| Area | Added | Modified |
|---|---|---|
| Browser integrations | `frontend/src/CalendarActions.tsx`, `calendar.ts`, `ShareActions.tsx`, `sharing.ts`, `EventLocations.tsx`, `EventMap.tsx`, `locations.ts`, `useBrowserLocation.ts` | `frontend/src/App.tsx`, `EventDetail.tsx`, `EventEditor.tsx`, `ParticipantDiscovery.tsx`, `dates.ts`, `styles.css` |
| Data and contracts | `shared/coordinates.ts`, `shared/eventTimes.ts` | `shared/contracts.ts`, `backend/src/data/database.ts`, `backend/src/data/eventRepository.ts`, `backend/src/services/eventValidation.ts` |
| Tests | `backend/test/location.test.ts`, `frontend/test/phase3.test.tsx`, `tests/browser/localApp.ts`, `tests/browser/phase-3.spec.ts` | `backend/test/events.test.ts`, `backend/test/participation.test.ts`, `frontend/test/app.test.tsx`, `tests/browser/event-workflow.spec.ts` |
| Setup and documentation | `docs/PHASE-3.md` | `README.md`, `package.json`, `package-lock.json` |

The only new direct dependencies are `leaflet` and the development-only `@types/leaflet`. No implementation-scope or traceability companion files were present. This document supplies the Phase 3 traceability.
