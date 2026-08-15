# FlexFit Studio — Refactoring Architecture

## Goal

Improve separation of concerns without changing the tRPC contract or the application's observable behavior.

## Before

Several routers mixed transport concerns with business workflows. The largest examples were:

- `bookings.ts`: booking, cancellation, credits, waitlist promotion, attendance, and read queries.
- `reschedules.ts`: mutation validation duplicated by the validation query.
- `corporate-bookings.ts`: corporate booking, cancellation, credit-pool handling, waitlist promotion, and attendance.
- `admin.ts`: nine unrelated reporting queries in one router.

## After

Domain mutations and reporting workflows now live under `src/server/services/`:

```text
src/server/
├── routers/
│   ├── bookings.ts
│   ├── corporate-bookings.ts
│   ├── reschedules.ts
│   └── admin.ts
├── services/
│   ├── booking-policy.ts
│   ├── booking-service.ts
│   ├── corporate-booking-service.ts
│   ├── admin-report-service.ts
│   ├── reschedule-policy.ts
│   └── reschedule-service.ts
└── trpc.ts
```

Routers now primarily handle:

1. input validation
2. authentication/authorization through tRPC procedures
3. query composition where no reusable business workflow exists
4. delegation to domain services

Services own multi-step business workflows and accept the database as an explicit dependency.

## Why not introduce repositories everywhere?

The application is small enough that repository classes for every table would add abstraction without solving an identified problem. The refactor extracts cohesive workflows rather than creating a generic data-access layer.

## Why policies are separate

Time-window and credit rules are deterministic and easy to test independently. Keeping these rules separate makes the important edge cases explicit without hiding database behavior behind unnecessary abstractions.

## Compatibility rule

Existing procedure names, input shapes, output shapes, error codes, and error messages were preserved for the refactored booking, corporate-booking, reschedule, and admin procedures.
