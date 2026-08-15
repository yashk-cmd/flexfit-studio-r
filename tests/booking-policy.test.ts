import { describe, expect, it } from "vitest";
import {
  FREE_CANCELLATION_HOURS,
  UNLIMITED_CREDITS,
  hoursUntil,
  isFreeCancellation,
  isUnlimitedCredits,
} from "@/server/services/booking-policy";
import {
  FREE_RESCHEDULE_HOURS,
  canReschedule,
} from "@/server/services/reschedule-policy";
import { CORPORATE_FREE_CANCELLATION_HOURS } from "@/server/services/corporate-booking-service";
import { hoursUntil as sharedHoursUntil } from "@/server/services/time-policy";

describe("booking policies", () => {
  const now = new Date("2026-08-14T12:00:00.000Z");

  it("calculates hours until a class starts", () => {
    expect(hoursUntil("2026-08-14T15:00:00.000Z", now)).toBe(3);
  });

  it("treats 999 or more credits as unlimited", () => {
    expect(isUnlimitedCredits(998)).toBe(false);
    expect(isUnlimitedCredits(UNLIMITED_CREDITS)).toBe(true);
    expect(isUnlimitedCredits(1500)).toBe(true);
  });

  it("uses the 12-hour cancellation boundary", () => {
    const start = "2026-08-15T00:00:00.000Z";
    expect(isFreeCancellation(start, 1, now)).toBe(true);
    expect(isFreeCancellation("2026-08-14T23:59:59.999Z", 1, now)).toBe(false);
    expect(FREE_CANCELLATION_HOURS).toBe(12);
  });

  it("does not refund a booking that used no credits", () => {
    expect(isFreeCancellation("2026-08-15T00:00:00.000Z", 0, now)).toBe(false);
  });
});

describe("reschedule policies", () => {
  const now = new Date("2026-08-14T12:00:00.000Z");

  it("allows rescheduling at exactly four hours", () => {
    expect(canReschedule("2026-08-14T16:00:00.000Z", now)).toBe(true);
    expect(FREE_RESCHEDULE_HOURS).toBe(4);
  });

  it("rejects rescheduling inside the four-hour window", () => {
    expect(canReschedule("2026-08-14T15:59:59.999Z", now)).toBe(false);
  });
});

describe("corporate booking policy", () => {
  it("keeps the corporate cancellation window at 24 hours", () => {
    expect(CORPORATE_FREE_CANCELLATION_HOURS).toBe(24);
    expect(sharedHoursUntil("2026-08-15T12:00:00.000Z", new Date("2026-08-14T12:00:00.000Z"))).toBe(24);
  });
});
