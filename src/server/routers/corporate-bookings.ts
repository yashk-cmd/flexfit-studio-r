import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { corporateBookings, classes, companies, checkins, users } from "@/db/schema";
import { router, protectedProcedure, staffProcedure } from "../trpc";
import {
  bookCorporateClass,
  cancelCorporateBooking,
  markCorporateBookingAttended,
  CORPORATE_FREE_CANCELLATION_HOURS,
} from "../services/corporate-booking-service";

export { CORPORATE_FREE_CANCELLATION_HOURS };

export const corporateBookingsRouter = router({
  mine: protectedProcedure.input(z.object({ includePast: z.boolean().default(false) }).default({})).query(async ({ ctx, input }) => {
    const rows = await ctx.db.select({ id: corporateBookings.id, status: corporateBookings.status, creditsUsed: corporateBookings.creditsUsed, bookedAt: corporateBookings.bookedAt, classId: classes.id, className: classes.name, room: classes.room, startsAt: classes.startsAt, durationMin: classes.durationMin, cancelled: classes.cancelled, companyName: companies.name }).from(corporateBookings).innerJoin(classes, eq(corporateBookings.classId, classes.id)).innerJoin(companies, eq(corporateBookings.companyId, companies.id)).where(eq(corporateBookings.userId, ctx.user.id)).orderBy(asc(classes.startsAt));
    const now = new Date();
    return rows.filter((r) => input.includePast ? true : new Date(r.startsAt) >= now);
  }),

  book: protectedProcedure.input(z.object({ classId: z.number() })).mutation(({ ctx, input }) => bookCorporateClass(ctx.db, ctx.user.id, input.classId)),
  cancel: protectedProcedure.input(z.object({ bookingId: z.number() })).mutation(({ ctx, input }) => cancelCorporateBooking(ctx.db, ctx.user.id, ctx.user.role, input.bookingId)),
  markAttended: staffProcedure.input(z.object({ bookingId: z.number(), source: z.enum(["front_desk", "kiosk", "app"]).default("front_desk") })).mutation(({ ctx, input }) => markCorporateBookingAttended(ctx.db, input.bookingId, input.source)),

  rosterFor: staffProcedure.input(z.object({ classId: z.number() })).query(({ ctx, input }) => ctx.db.select({ bookingId: corporateBookings.id, status: corporateBookings.status, memberId: users.id, memberName: users.name, memberEmail: users.email, bookedAt: corporateBookings.bookedAt, companyName: companies.name }).from(corporateBookings).innerJoin(users, eq(corporateBookings.userId, users.id)).innerJoin(companies, eq(corporateBookings.companyId, companies.id)).where(eq(corporateBookings.classId, input.classId)).orderBy(asc(corporateBookings.bookedAt))),
});
