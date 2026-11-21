# SpartIN NFR-05 performance report

**Pass for the measured local workload.** The mixed test ran 100 concurrent virtual users against 1,007 events. All **8,069 of 8,069 requests (100%)** completed within two seconds. Client-observed p95 was **155.57 ms**, with zero unexpected failures.

## Reproduce

Use Node.js 24.14 or a supported Node 24 runtime. From the repo root:

```sh
npm ci
npm run test:load
```

The command builds the app and runs the dependency-free [Node load driver](../scripts/load-test.mjs). It has no external target option. It starts a separate real Express process at an ephemeral loopback port with its own temporary SQLite file. The file gets the standard schema and seeds plus 1,000 synthetic events, two five-seat contention events, 100 participant accounts, and 20 organizer accounts. The driver signs in through the real demo-session endpoint. It uses role and ownership checks for all subsequent API calls. Test sessions are injected only into the test worker’s app instance. Setup, sign-in, post-run checks, and cleanup are outside timed results. The development SQLite file is outside the benchmark.

Measured November 21, 2026 on Windows 11 Pro with Intel Core i5-14600K, 20 logical CPUs, 32,452 MiB RAM, Node.js v24.14.0, Express 5.3.0, and SQLite 3.51.2. Client and service were separate processes on the same host. Other SpartIN validation workloads were idle during the measured run. SQLite used foreign keys, a 5,000 ms busy timeout, the default journal mode, and `BEGIN IMMEDIATE` for capacity-sensitive writes.

## Workload

The closed-loop users each issued one request at a time. They had a deterministic initial spread of 0–180 ms and a 160–360 ms pause between requests. Measured duration includes the final request drain and pacing sleep. The first three stages targeted six seconds each. The acceptance stage targeted 24 seconds.

| Stage | Planned operation mix | Actual request count by operation |
|---|---|---|
| A. Browse | 100 participants, list 40%, detail 40%, discovery 20% | 920 list, 890 detail, 459 discovery |
| B. Participation | 100 participants, Join, status, Leave, and Pass in rotation | 400 Join, 398 status, 352 Leave, 301 Pass |
| C. Organizer | 20 organizers, create, update, retrieve, and delete their own test events | 120 create, 113 update, 106 retrieve, 102 delete |
| Mixed acceptance | 80 participants and 20 organizers. Each follows a ten-operation rotation with seven reads and three writes. | 1,966 list, 490 owned list, 1,936 detail, 640 discovery, 640 status, 640 Join, 640 Leave, 639 Pass, 160 create, 160 update, 158 delete. The observed mix was 5,672 reads and 2,397 writes (70.3% / 29.7%). |
| D. Contention | Two 100-request Join bursts against separate five-seat events, with waitlist off and on. Then repeat the same waiting Join and joined Leave concurrently. | 205 Join and five Leave requests. |

## Results

Latency is end-to-end client-observed time from request invocation through response body consumption and JSON parsing. Percentiles use the nearest-rank rule. Unexpected transport errors and HTTP status mismatches are failures. The 95 expected `409 FULL` responses in scenario D are accounted for separately as valid business outcomes.

| Stage | VUs | Seconds | Requests | HTTP 2xx | Expected conflicts | Unexpected failures | Error rate | Requests/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A. Browse | 100 | 6.34 | 2269 | 2269 | 0 | 0 | 0.00% | 358.10 |
| B. Participation | 100 | 6.43 | 1451 | 1451 | 0 | 0 | 0.00% | 225.51 |
| C. Organizer | 20 | 6.26 | 441 | 441 | 0 | 0 | 0.00% | 70.40 |
| Mixed acceptance | 100 | 24.34 | 8069 | 8069 | 0 | 0 | 0.00% | 331.51 |
| D. Contention | 100 | 0.64 | 210 | 115 | 95 | 0 | 0.00% | 329.08 |

| Stage | Median ms | p90 ms | p95 ms | p99 ms | Maximum ms | Within 2 s | Backend CPU, 1 core | Peak backend RSS MiB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A. Browse | 2.03 | 6.59 | 11.41 | 24.88 | 38.87 | 2269/2269 | 28.9% | 69.6 |
| B. Participation | 153.30 | 277.69 | 287.78 | 354.70 | 492.28 | 1451/1451 | 22.8% | 74.2 |
| C. Organizer | 6.40 | 12.30 | 14.81 | 47.24 | 73.10 | 441/441 | 8.7% | 73.5 |
| Mixed acceptance | 7.27 | 120.29 | 155.57 | 207.22 | 361.05 | 8069/8069 | 28.9% | 88.0 |
| D. Contention | 46.48 | 445.34 | 513.86 | 560.32 | 570.34 | 210/210 | 17.2% | 86.8 |

Backend CPU is process CPU time divided by measured wall time, expressed as a percentage of one core. RSS is the maximum sampled backend resident memory during each stage at 250 ms intervals, with boundary samples included. The benchmark excludes frontend rendering, external services, and WAN latency.

## Contention and acceptance

- Closed enrollment produced exactly five Joined and 95 Full responses.
- Open enrollment produced five Joined and 95 Waitlisted responses. Initial positions were exactly 1–95. Five repeated Join requests preserved position 1. Five simultaneous Leave retries on the same Joined record promoted just the first waiter. Five seats remained reserved, 94 waiters remained, and the next waiter moved to position 1.
- Foreign keys and SQLite integrity checks passed. An aggregate check found zero over-capacity events. Event count returned to 1,007 after owned test records were removed.
- The mixed run met the PRD and TP target for dataset size, active virtual users, request mix, and proportion completed within two seconds. It also recorded zero unexpected failures. The measured workload met the target with the existing database behavior. Browser and physical-device compatibility are tracked separately.
