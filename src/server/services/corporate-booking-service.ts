import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { checkins, classes, companies, companyMembers, corporateBookings } from "@/db/schema";

export const CORPORATE_FREE_CANCELLATION_HOURS = 24;
type Database = typeof db;

import { hoursUntil } from "./time-policy";

async function getClassOrThrow(database: Database, classId: number) {
  const cls = await database.select().from(classes).where(eq(classes.id, classId)).get();
  if (!cls) throw new TRPCError({ code: "NOT_FOUND", message: "Class not found." });
  if (cls.cancelled) throw new TRPCError({ code: "BAD_REQUEST", message: "This class has been cancelled." });
  if (hoursUntil(cls.startsAt) <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "This class has already started." });
  return cls;
}

async function getCompanyForMember(database: Database, userId: number) {
  return database.select().from(companyMembers).innerJoin(companies, eq(companyMembers.companyId, companies.id)).where(and(eq(companyMembers.userId, userId), eq(companies.active, true))).get();
}

export async function bookCorporateClass(database: Database, userId: number, classId: number) {
  const cls = await getClassOrThrow(database, classId);
  const existing = await database.select().from(corporateBookings).where(and(eq(corporateBookings.classId, cls.id), eq(corporateBookings.userId, userId), inArray(corporateBookings.status, ["booked", "waitlisted"]))).get();
  if (existing) throw new TRPCError({ code: "CONFLICT", message: "You are already on the list for this class." });

  const companyRow = await getCompanyForMember(database, userId);
  if (!companyRow) throw new TRPCError({ code: "FORBIDDEN", message: "You are not linked to an active company." });
  const company = companyRow.companies;
  if (company.creditPoolBalance < cls.creditCost) throw new TRPCError({ code: "FORBIDDEN", message: "Your company does not have enough credits." });

  const [{ count }] = await database.select({ count: sql<number>`count(*)` }).from(corporateBookings).where(and(eq(corporateBookings.classId, cls.id), eq(corporateBookings.status, "booked")));
  const isFull = Number(count) >= cls.capacity;
  const created = await database.insert(corporateBookings).values({ classId: cls.id, userId, companyId: company.id, status: isFull ? "waitlisted" : "booked", creditsUsed: isFull ? 0 : cls.creditCost }).returning().get();

  if (!isFull) {
    await database.update(companies).set({ creditPoolBalance: company.creditPoolBalance - cls.creditCost }).where(eq(companies.id, company.id));
  }
  return created;
}

export async function cancelCorporateBooking(database: Database, userId: number, userRole: "member" | "trainer" | "admin", bookingId: number) {
  const row = await database.select({ booking: corporateBookings, cls: classes }).from(corporateBookings).innerJoin(classes, eq(corporateBookings.classId, classes.id)).where(eq(corporateBookings.id, bookingId)).get();
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
  const isOwner = row.booking.userId === userId;
  const isStaff = userRole === "admin" || userRole === "trainer";
  if (!isOwner && !isStaff) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot cancel this booking." });
  if (row.booking.status !== "booked" && row.booking.status !== "waitlisted") throw new TRPCError({ code: "BAD_REQUEST", message: "This booking is no longer active." });

  const wasBooked = row.booking.status === "booked";
  const refundable = hoursUntil(row.cls.startsAt) >= CORPORATE_FREE_CANCELLATION_HOURS && row.booking.creditsUsed > 0;
  await database.update(corporateBookings).set({ status: "cancelled", cancelledAt: new Date().toISOString() }).where(eq(corporateBookings.id, row.booking.id));

  if (refundable) {
    const company = await database.select().from(companies).where(eq(companies.id, row.booking.companyId)).get();
    if (company) await database.update(companies).set({ creditPoolBalance: company.creditPoolBalance + row.booking.creditsUsed }).where(eq(companies.id, company.id));
  }

  if (wasBooked) {
    const next = await database.select().from(corporateBookings).where(and(eq(corporateBookings.classId, row.cls.id), eq(corporateBookings.status, "waitlisted"))).orderBy(asc(corporateBookings.bookedAt)).get();
    if (next) {
      await database.update(corporateBookings).set({ status: "booked", creditsUsed: row.cls.creditCost }).where(eq(corporateBookings.id, next.id));
      const company = await database.select().from(companies).where(eq(companies.id, next.companyId)).get();
      if (company && company.creditPoolBalance >= row.cls.creditCost) {
        await database.update(companies).set({ creditPoolBalance: Math.max(0, company.creditPoolBalance - row.cls.creditCost) }).where(eq(companies.id, company.id));
      }
    }
  }
  return { ok: true, refunded: refundable };
}

export async function markCorporateBookingAttended(database: Database, bookingId: number, source: "front_desk" | "kiosk" | "app") {
  const booking = await database.select().from(corporateBookings).where(eq(corporateBookings.id, bookingId)).get();
  if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
  if (booking.status !== "booked") throw new TRPCError({ code: "BAD_REQUEST", message: "Only confirmed bookings can be checked in." });
  await database.update(corporateBookings).set({ status: "attended" }).where(eq(corporateBookings.id, booking.id));
  // Preserve the original application's check-in shape exactly.
  await database.insert(checkins).values({ userId: booking.userId, bookingId: null });
  return { ok: true };
}
