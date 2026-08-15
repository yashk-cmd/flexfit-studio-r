# FlexFit Studio — Test Strategy

## Regression principle

The refactor must preserve the original application's observable behavior: inputs, outputs, errors, and important edge cases.

## Automated coverage added

Deterministic business rules are covered without requiring a running web server:

- booking time calculations
- 12-hour cancellation boundary
- no-credit cancellation behavior
- unlimited-credit threshold
- four-hour reschedule boundary
- corporate 24-hour cancellation policy

The test suite is intentionally separated from database integration tests so these rules remain fast and deterministic.

## Manual verification matrix

Before submission, verify the seeded application manually for:

### Member
- login
- dashboard
- plans
- schedule
- booking
- cancellation
- rescheduling
- waitlist
- notifications

### Staff
- trainer schedule
- front-desk attendance
- class roster

### Admin
- dashboard statistics
- attendance
- announcements
- companies
- reports
- refunds/payment operations

### Corporate
- company membership
- credit pool usage
- corporate booking
- cancellation
- waitlist behavior
- attendance

## Verification commands

```bash
npm test
npx tsc --noEmit
npm run build
```
