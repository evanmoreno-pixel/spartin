# SpartIN in-app Calendar

The participant Calendar implements the day, week, month, year, period navigation, and Today controls described in [SFDS §6.1–6.2](SFDS.md#user-interface-design). Sign in with a participant demo account and select **Calendar**. It opens at `/participant/calendar` in Month view on the current local date.

## Views and controls

| View | Behavior |
|---|---|
| Month | Sunday-first grid. On wider screens, a cell shows up to two event titles with a count for additional events. Narrow screens show the total event count in the date button. Selecting a date updates the full agenda below the grid. |
| Week | Seven days starting on Sunday. Each day shows event titles, start times, and locations. Day headings open the Day view. The seven columns wrap into stacked cards on narrower screens. |
| Day | A single agenda with event titles, start and end times, and locations. |
| Year | Twelve mini calendars. An underline and gold highlight mark dates with events. Accessible cell labels include event counts. Select a month heading to open its Month view. |

Previous and Next move one period at a time. **Today** retains the current view and selects today's date. Use Tab to move between controls and Enter or Space to activate buttons. The active view and selected month date use `aria-pressed`, and the current date uses `aria-current`. Period headings announce changes. The calendar displays loading, retry, and empty states. Event links open the existing Event Details page and its usual actions. **Back to Calendar** restores the date and view.

## Architecture and data

| File | Responsibility |
|---|---|
| `frontend/src/ParticipantCalendar.tsx` | Route-level component with Month, Week, Year, and shared agenda components. React Router query parameters hold the view and local date so refresh preserves navigation. |
| `frontend/src/calendarDates.ts` | Local date keys, period boundaries, Sunday-first rows, calendar arithmetic, and grouping events by date. |
| `frontend/src/participantCalendar.css` | Responsive layouts, selection indicators, and Calendar styling using the existing SpartIN design variables. |
| `frontend/src/api.ts` | Loads the existing paginated event catalog using `GET /api/events?page=…` and deduplicates by event ID. |
| `frontend/src/App.tsx`, `ParticipantDiscovery.tsx`, `EventDetail.tsx` | Registers the participant route, adds its navigation link, and restores Calendar context from Event Details. |

The signed-in participant Calendar uses the same catalog as **Browse all**. Express returns scheduled events with an end time in the future, including currently running events. The swipe deck applies additional participation filters, so a joined or passed event can still appear on the calendar while it remains in the catalog. Organizer-only, postponed, ended, and deleted records are outside the calendar catalog. Existing Event Details continue to load through `GET /api/events/:id`.

The event catalog has page numbers and a `hasNext` flag. The calendar loads each page once per refresh and groups events for the selected view in the browser. Switching dates or views uses the loaded data. The existing `useResource` refresh behavior reloads on window focus, when the tab becomes visible, and every 15 seconds while visible. **Refresh events** starts a manual reload. The feature requires zero new endpoints, dependencies, or SQLite migrations.

## Dates and timezone

SQLite and API timestamps remain UTC. The browser uses its local timezone for dates and display times. Calendar navigation uses local civil dates and builds each day's midnight independently, so 23-hour and 25-hour days still occupy one calendar cell each. An event appears on every date it overlaps. An event that ends exactly at local midnight does not occupy the next date. Agendas include the local dates alongside times for overnight events and show both timezone abbreviations when the offset changes between the start and end. Existing event creation and external calendar exports retain their timestamp behavior.

## Differences and limitations

- The SFDS specifies category filters. The existing Event model has no structured categories, so the Calendar omits this filter. The page displays SpartIN event records without importing an academic calendar or adding a joined-only filter.
- The SFDS references the Calendar mockup as `docs/media/image4.png`. That asset is absent from this checkout. The figure caption and component specification guided the layout, with the existing participant navigation and components supplying the visual style.
- Historical dates remain navigable. Ended events leave the catalog according to the existing availability rules.

## Verification

The baseline build passed, along with 89 Vitest tests and 10 Edge Playwright tests. The final build passed with the following results.

| Suite | Passed | Failed | Skipped or excluded |
|---|---:|---:|---:|
| Vitest | 97 | 0 | 0 |
| Playwright on Microsoft Edge | 13 | 0 | 0 |
| Playwright on Chrome for Testing | 13 | 0 | 0 |
| Playwright WebKit on Windows | 12 | 0 | 1 |

Eight new Vitest tests cover local-date arithmetic, leap years, month and year boundaries, overnight events, spring and fall daylight-saving transitions, pagination, views and navigation, Event Details, error recovery, and role scoping. Three new Playwright tests per engine cover the 1,280-pixel desktop view, keyboard focus and activation, targeted axe checks, the 320-pixel touch-emulated layout, and organizer creation, rescheduling, postponement, republication and deletion against a temporary SQLite file. The browser tests verified local times, event count updates, and the existing API's authorization and visibility rules.

The WebKit run excluded one existing waitlist test that uses Chromium's DevTools Protocol for touch input. It passed on Edge and Chrome. An initial parallel Edge run surfaced an intermittent Leaflet map error, and the full Edge rerun passed. Physical phones and the installed Safari browser were outside this verification. The mobile results are from browser emulation.

The existing backend load regression also passed on a separate temporary database. In the mixed scenario, all 8,083 requests completed within two seconds at 100 concurrent virtual users against 1,007 events. There were zero unexpected failures and p95 was 171.23 ms. This measures the backend workload. Calendar rendering was exercised separately in the browser tests.
