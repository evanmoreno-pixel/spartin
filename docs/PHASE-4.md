# SpartIN Phase 4 stabilization

**Release decision: Ready for the local course demonstration with known limitations.**

Phase 4 verifies the existing React, Express and SQLite implementation for FR-01 through FR-08. The production build passed. There were 78 API and component passes and 29 browser passes across Edge, Chrome for Testing and Playwright WebKit. The organizer → participant → FIFO waitlist → organizer cleanup workflow passed on all three engines. The development database and the original five specifications were preserved.

## What changed

- The API checks the origin of browser mutations and redacts unexpected request details from server logs. Vite preserves the browser Host through the local proxy. The development UI port can be overridden while retaining 5173 as the default.
- The lockfile updates Vitest to the advisory-fixed version. Two development-only validators support repeatable accessibility and calendar checks.
- The benchmark starts a private loopback API with temporary SQLite fixtures and uses the same authorization and application services. The acceptance run passed with 100 VUs, 1,007 events, a p95 of 155.57 ms, 100% within two seconds, and zero unexpected mixed-load failures. The contention run preserved capacity and FIFO order.
- Tests expand coverage for real Vite proxy login/logout, defensive request handling, migration of a populated queue, transactional rollback, independent calendar parsing and accessibility. Existing tests remain in the suite.

## Release artifacts

- [Final test report](FINAL-TEST-REPORT.md) records baseline and final runs, the system workflow, accessibility and fixes.
- [Requirements traceability](REQUIREMENTS-TRACEABILITY.md) covers all canonical FRs and NFRs and distinguishes historical test references from current evidence.
- [Performance report](PERFORMANCE-REPORT.md) records the workload, results and reproduction command for NFR-05.
- [Security review](SECURITY-REVIEW.md) records findings, corrections and remaining demo limitations.
- [Release checklist](RELEASE-CHECKLIST.md) lists the release gates and demonstration steps.

The [Phase 1](PHASE-1.md), [Phase 2](PHASE-2.md), and [Phase 3](PHASE-3.md) notes retain their historical test results. Authentication stays simulated and loopback-only. FR-09, FR-10 and NFR-04 no-show detection remain deferred.
