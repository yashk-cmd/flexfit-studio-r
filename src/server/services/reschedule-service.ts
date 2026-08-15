import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, classes, memberships, reschedules } from "@/db/schema";

import { hoursUntil } from "./time-policy";
import { canReschedule, FREE_RESCHEDULE_HOURS } from "./reschedule-policy";

export { FREE_RESCHEDULE_HOURS } from "./reschedule-policy";

type Database = typeof db;

type ValidationData = {
  originalBooking: typeof bookings.$inferSelect;
  originalClass: typeof classes.$inferSelect;
  targetClass: typeof classes.$inferSelect;
  targetIsFull: boolean;
};

async function loadValidation(
  database: Database,
  userId: number,
  fromBookingId: number,
  toClassId: number,
): Promise<{ data?: ValidationData; reason?: string }> {
  const originalRow = await database
    .select({ booking: bookings, cls: classes })
    .from(bookings)
    .innerJoin(classes, eq(bookings.classId, classes.id))
    .where(eq(bookings.id, fromBookingId))
    .get();

  if (!originalRow) return { reason: "Booking not found." };

  const { booking: originalBooking, cls: originalClass } = originalRow;

  if (originalBooking.userId !== userId) {
    return { reason: "You cannot reschedule this booking." };
  }

  if (originalBooking.status !== "booked" && originalBooking.status !== "waitlisted") {
    return { reason: "This booking is no longer active." };
  }

  if (!canReschedule(originalClass.startsAt)) {
    return {
      reason: `You can only reschedule up to ${FREE_RESCHEDULE_HOURS} hours before the class starts.`,
    };
  }

  const targetClass = await database
    .select()
    .from(classes)
    .where(eq(classes.id, toClassId))
    .get();

  if (!targetClass) return { reason: "Target class not found." };

  if (targetClass.name !== originalClass.name) {
    return { reason: "You can only reschedule to a class with the same name." };
  }

  if (targetClass.id === originalClass.id) {
    return { reason: "You are already booked for this class." };
  }

  if (hoursUntil(targetClass.startsAt) <= 0) {
    return { reason: "This class has already started." };
  }

  if (targetClass.cancelled) {
    return { reason: "This class has been cancelled." };
  }

  const existingBooking = await database
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.classId, targetClass.id),
        eq(bookings.userId, userId),
        sql`${bookings.status} in ('booked', 'waitlisted')`,
      ),
    )
    .get();

  if (existingBooking) {
    return { reason: "You already have an active booking for this class." };
  }

  const [{ count }] = await database
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(eq(bookings.classId, targetClass.id), eq(bookings.status, "booked")),
    );

  return {
    data: {
      originalBooking,
      originalClass,
      targetClass,
      targetIsFull: Number(count) >= targetClass.capacity,
    },
  };
}

export async function validateReschedule(
  database: Database,
  userId: number,
  fromBookingId: number,
  toClassId: number,
) {
  const result = await loadValidation(database, userId, fromBookingId, toClassId);

  if (result.reason) {
    return { valid: false as const, reason: result.reason };
  }

  return { valid: true as const, targetIsFull: result.data!.targetIsFull };
}

export async function rescheduleBooking(
  database: Database,
  userId: number,
  fromBookingId: number,
  toClassId: number,
) {
  const result = await loadValidation(database, userId, fromBookingId, toClassId);

  if (result.reason || !result.data) {
    const reason = result.reason ?? "Unable to validate reschedule.";

    if (reason === "Booking not found." || reason === "Target class not found.") {
      throw new TRPCError({ code: "NOT_FOUND", message: reason });
    }
    if (reason === "You cannot reschedule this booking.") {
      throw new TRPCError({ code: "FORBIDDEN", message: reason });
    }
    if (reason === "You already have an active booking for this class.") {
      throw new TRPCError({ code: "CONFLICT", message: reason });
    }

    throw new TRPCError({ code: "BAD_REQUEST", message: reason });
  }

  const { originalBooking, originalClass, targetClass, targetIsFull } = result.data;

  // Preserve the existing membership lookup/order even though the current
  // implementation does not use the value. It is intentionally left here so
  // this refactor does not change observable database access behavior.
  if (originalBooking.membershipId) {
    await database
      .select()
      .from(memberships)
      .where(eq(memberships.id, originalBooking.membershipId))
      .get();
  }

  const newBooking = await database
    .insert(bookings)
    .values({
      classId: targetClass.id,
      userId,
      membershipId: originalBooking.membershipId,
      status: targetIsFull ? "waitlisted" : "booked",
      creditsUsed: originalBooking.creditsUsed,
    })
    .returning()
    .get();

  await database
    .update(bookings)
    .set({ status: "cancelled", cancelledAt: new Date().toISOString() })
    .where(eq(bookings.id, originalBooking.id));

  await database.insert(reschedules).values({
    userId,
    fromBookingId: originalBooking.id,
    toBookingId: newBooking.id,
    fromClassId: originalClass.id,
    toClassId: targetClass.id,
  });

  return {
    ok: true,
    newBooking,
    newStatus: targetIsFull ? "waitlisted" : "booked",
  };
}
