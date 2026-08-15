# FlexFit Studio — Known Issues and Deferred Changes

## Multi-write operations are not transactional

Booking cancellation, rescheduling, and corporate booking workflows perform multiple writes. A failure between writes could leave partial state.

This was deliberately not changed because introducing transactions changes failure behavior and needs its own integration tests.

## Corporate and member booking parity

The two workflows share concepts such as class validation, capacity, waitlists, and cancellation, but their credit sources and cancellation windows differ. They were extracted into separate services rather than forced into one generic abstraction.

## Corporate attendance data shape

The original corporate attendance procedure inserts a check-in with `bookingId: null` and ignores the supplied source. The refactor preserves this behavior rather than silently changing the data model.

## Unused membership lookup in rescheduling

The original reschedule workflow queried the membership associated with the source booking but did not use the result. That lookup is preserved while its redundancy is documented.
