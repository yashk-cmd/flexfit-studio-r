# FlexFit Studio — Refactoring Decisions

## 1. Extract booking mutations into a service

### Problem
`bookings.ts` contained class validation, duplicate-booking checks, membership lookup, credit calculations, capacity checks, booking creation, cancellation/refund logic, waitlist promotion, and check-in persistence.

### Decision
Move booking, cancellation, and attendance workflows to `booking-service.ts` and move deterministic credit/cancellation rules to `booking-policy.ts`.

### Result
The router is substantially smaller and business rules can be tested independently of tRPC.

## 2. Consolidate reschedule validation

### Problem
The `reschedule` mutation and `validateReschedule` query contained nearly identical validation logic.

### Decision
Create one internal validation workflow in `reschedule-service.ts` and a small deterministic policy module for the four-hour boundary.

### Result
There is one source of truth for reschedule eligibility.

## 3. Extract corporate booking workflows

### Problem
`corporate-bookings.ts` mixed company membership lookup, class validation, corporate credit-pool accounting, waitlist promotion, cancellation, and attendance.

### Decision
Move those mutations to `corporate-booking-service.ts`, while preserving the separate corporate persistence model and its 24-hour cancellation policy.

### Result
The router stays focused on tRPC input/auth and read queries. Member and corporate flows remain separate because their credit sources and cancellation rules differ.

## 4. Extract admin reporting

### Problem
`admin.ts` contained nine unrelated reporting queries.

### Decision
Move report composition and result normalization to `admin-report-service.ts`.

### Result
The router is now a small map of admin procedures to reporting operations. No report output shape was changed.

## 5. Keep the data model unchanged

No schema changes were made. The existing schema is sufficient for the structural refactor and avoiding a migration reduces behavioral risk.

## 6. Do not silently fix suspicious behavior

Potential defects are documented rather than silently corrected. For example, corporate attendance originally created a check-in with `bookingId: null`; that behavior was intentionally preserved during extraction.

## 7. Do not add transactions automatically

Several workflows perform multiple writes. Transactions could improve consistency, but changing transaction boundaries changes failure semantics. That is a separate behavior-changing decision and is therefore documented rather than mixed into this refactor.

## 8. Centralize shared time calculations

### Problem
Booking, rescheduling, and corporate booking code all need the same `hoursUntil` calculation. Keeping separate copies would make future fixes easy to miss.

### Decision
Create `time-policy.ts` as the single implementation and re-export it from the booking/reschedule policy modules where compatibility is useful.

### Result
There is one implementation of the time calculation while each domain retains its own business thresholds.
