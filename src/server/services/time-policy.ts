/** Shared time calculations used by booking-related business rules. */
export function hoursUntil(iso: string, now = new Date()): number {
  return (new Date(iso).getTime() - now.getTime()) / 36e5;
}
