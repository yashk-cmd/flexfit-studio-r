import { hoursUntil } from "./time-policy";

export const FREE_CANCELLATION_HOURS = 12;
export const UNLIMITED_CREDITS = 999;

export { hoursUntil } from "./time-policy";

export function isUnlimitedCredits(creditsRemaining: number): boolean {
  return creditsRemaining >= UNLIMITED_CREDITS;
}

export function isFreeCancellation(
  startsAt: string,
  creditsUsed: number,
  now = new Date(),
): boolean {
  return (
    hoursUntil(startsAt, now) >= FREE_CANCELLATION_HOURS && creditsUsed > 0
  );
}
