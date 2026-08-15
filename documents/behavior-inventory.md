# FlexFit Studio — Behavior Inventory

## Purpose

This document records the behavior discovered in the existing implementation before structural refactoring. The refactor is intended to preserve these observable rules unless a change is explicitly documented as a defect fix.

## Member booking

- A class must exist, must not be cancelled, and must not have started.
- A member cannot have an active (`booked` or `waitlisted`) booking for the same class twice.
- An active membership is required.
- A finite membership must have enough credits for the class.
- A membership with `creditsRemaining >= 999` is treated as unlimited.
- A class is waitlisted when confirmed bookings are already at capacity.
- Waitlisted bookings consume zero credits at creation time.
- Confirmed bookings consume the class credit cost unless the membership is unlimited.

## Cancellation

- The booking must exist and belong to the member, unless the caller is staff.
- Only `booked` and `waitlisted` bookings can be cancelled.
- A booking is refundable when at least 12 hours remain and the booking used credits.
- A refundable booking restores its used credits to the membership unless the membership is unlimited.
- Cancelling a confirmed booking promotes the oldest waitlisted booking.
- Promotion changes the waitlisted booking to `booked`, assigns the class credit cost, and deducts credits from its membership when finite.

## Check-in

- Only staff can mark attendance.
- Only confirmed bookings can be checked in.
- The booking is changed to `attended` and a check-in row is inserted with the supplied source.

## Rescheduling

- Only the booking owner can reschedule.
- Only active (`booked` or `waitlisted`) bookings can be rescheduled.
- Rescheduling is allowed only when at least four hours remain before the original class.
- The destination class must exist, have the same class name, be different from the source, not have started, and not be cancelled.
- An existing active booking for the destination class blocks the reschedule.
- A full destination becomes a waitlisted booking.
- The new booking keeps the original membership and credits used; no new credit charge is made.
- The original booking is cancelled and a reschedule history row is created.

## Important baseline observations

- Booking and corporate booking contain overlapping business concepts but use different persistence models.
- Reschedule validation was implemented twice: once in the mutation and once in the validation query.
- The original reschedule mutation performs a membership lookup whose result is not used.
- Some multi-write business operations are not wrapped in database transactions. This is documented as a design risk rather than changed automatically because transaction boundaries can alter failure behavior.
