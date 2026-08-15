import { hoursUntil } from "./time-policy";

export const FREE_RESCHEDULE_HOURS = 4;

export { hoursUntil } from "./time-policy";

export function canReschedule(startsAt: string, now = new Date()): boolean {
  return hoursUntil(startsAt, now) >= FREE_RESCHEDULE_HOURS;
}
