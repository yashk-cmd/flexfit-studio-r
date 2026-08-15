import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, checkins, classes, memberships } from "@/db/schema";

/** Members may cancel free of charge up to this many hours before class start. */
import {
  hoursUntil,
  isFreeCancellation,
  isUnlimitedCredits,
} from "./booking-policy";

type Database = typeof db;

export async function activeMembershipFor(database: Database, userId: number) {
  const today = new Date().toISOString().slice(0, 10);

  return database
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.status, "active"),
        sql`${memberships.endDate} >= ${today}`,
      ),
    )
    .orderBy(desc(memberships.endDate))
    .get();
}

async function getClassOrThrow(database: Database, classId: number) {
  const cls = await database
    .select()
    .from(classes)
    .where(eq(classes.id, classId))
    .get();

  if (!cls) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
  }

  if (cls.cancelled) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This class has been cancelled.",
    });
  }

  if (hoursUntil(cls.startsAt) <= 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This class has already started.",
    });
  }

  return cls;
}

async function ensureNotAlreadyOnClass(database: Database, userId: number, classId: number) {
  const existing = await database
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.classId, classId),
        eq(bookings.userId, userId),
        inArray(bookings.status, ["booked", "waitlisted"]),
      ),
    )
    .get();

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "You are already on the list for this class.",
    });
  }
}

async function confirmedBookingCount(database: Database, classId: number) {
  const [{ count }] = await database
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(eq(bookings.classId, classId), eq(bookings.status, "booked")));

  return Number(count);
}

/**
 * Creates a normal member booking and owns the associated credit rules.
 * The router deliberately stays thin and only handles transport/auth concerns.
 */
export async function bookClass(database: Database, userId: number, classId: number) {
  const cls = await getClassOrThrow(database, classId);
  await ensureNotAlreadyOnClass(database, userId, cls.id);

  const membership = await activeMembershipFor(database, userId);
  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "An active membership is required to book classes.",
    });
  }

  const unlimited = isUnlimitedCredits(membership.creditsRemaining);
  if (!unlimited && membership.creditsRemaining < cls.creditCost) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not enough class credits remaining.",
    });
  }

  const isFull = (await confirmedBookingCount(database, cls.id)) >= cls.capacity;

  const created = await database
    .insert(bookings)
    .values({
      classId: cls.id,
      userId,
      membershipId: membership.id,
      status: isFull ? "waitlisted" : "booked",
      creditsUsed: isFull ? 0 : cls.creditCost,
    })
    .returning()
    .get();

  if (!isFull && !unlimited) {
    await database
      .update(memberships)
      .set({ creditsRemaining: membership.creditsRemaining - cls.creditCost })
      .where(eq(memberships.id, membership.id));
  }

  return created;
}

async function restoreCreditsIfEligible(
  database: Database,
  booking: typeof bookings.$inferSelect,
  startsAt: string,
) {
  const refundable = isFreeCancellation(startsAt, booking.creditsUsed);

  if (!refundable || !booking.membershipId) {
    return refundable;
  }

  const membership = await database
    .select()
    .from(memberships)
    .where(eq(memberships.id, booking.membershipId))
    .get();

  if (membership && !isUnlimitedCredits(membership.creditsRemaining)) {
    await database
      .update(memberships)
      .set({ creditsRemaining: membership.creditsRemaining + booking.creditsUsed })
      .where(eq(memberships.id, membership.id));
  }

  return refundable;
}

async function promoteNextWaitlisted(database: Database, classId: number, creditCost: number) {
  const next = await database
    .select()
    .from(bookings)
    .where(
      and(eq(bookings.classId, classId), eq(bookings.status, "waitlisted")),
    )
    .orderBy(asc(bookings.bookedAt))
    .get();

  if (!next) return;

  await database
    .update(bookings)
    .set({ status: "booked", creditsUsed: creditCost })
    .where(eq(bookings.id, next.id));

  if (next.membershipId) {
    const membership = await database
      .select()
      .from(memberships)
      .where(eq(memberships.id, next.membershipId))
      .get();

    if (membership && !isUnlimitedCredits(membership.creditsRemaining)) {
      await database
        .update(memberships)
        .set({
          creditsRemaining: Math.max(
            0,
            membership.creditsRemaining - creditCost,
          ),
        })
        .where(eq(memberships.id, membership.id));
    }
  }
}

export async function cancelBooking(
  database: Database,
  userId: number,
  userRole: "member" | "trainer" | "admin",
  bookingId: number,
) {
  const row = await database
    .select({ booking: bookings, cls: classes })
    .from(bookings)
    .innerJoin(classes, eq(bookings.classId, classes.id))
    .where(eq(bookings.id, bookingId))
    .get();

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
  }

  const isOwner = row.booking.userId === userId;
  const isStaff = userRole === "admin" || userRole === "trainer";
  if (!isOwner && !isStaff) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You cannot cancel this booking.",
    });
  }

  if (row.booking.status !== "booked" && row.booking.status !== "waitlisted") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This booking is no longer active.",
    });
  }

  const wasBooked = row.booking.status === "booked";

  await database
    .update(bookings)
    .set({ status: "cancelled", cancelledAt: new Date().toISOString() })
    .where(eq(bookings.id, row.booking.id));

  const refunded = await restoreCreditsIfEligible(database, row.booking, row.cls.startsAt);

  if (wasBooked) {
    await promoteNextWaitlisted(database, row.cls.id, row.cls.creditCost);
  }

  return { ok: true, refunded };
}

export async function markBookingAttended(
  database: Database,
  bookingId: number,
  source: "front_desk" | "kiosk" | "app",
) {
  const booking = await database
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .get();

  if (!booking) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
  }

  if (booking.status !== "booked") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only confirmed bookings can be checked in.",
    });
  }

  await database
    .update(bookings)
    .set({ status: "attended" })
    .where(eq(bookings.id, booking.id));

  await database.insert(checkins).values({
    userId: booking.userId,
    bookingId: booking.id,
    source,
  });

  return { ok: true };
}
