import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { classes, reschedules } from "@/db/schema";
import { router, protectedProcedure } from "../trpc";
import {
  rescheduleBooking,
  validateReschedule,
} from "../services/reschedule-service";

export { FREE_RESCHEDULE_HOURS } from "../services/reschedule-service";

const rescheduleInput = z.object({
  fromBookingId: z.number(),
  toClassId: z.number(),
});

export const reschedulesRouter = router({
  reschedule: protectedProcedure
    .input(rescheduleInput)
    .mutation(({ ctx, input }) =>
      rescheduleBooking(ctx.db, ctx.user.id, input.fromBookingId, input.toClassId),
    ),

  history: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: reschedules.id,
        rescheduledAt: reschedules.rescheduledAt,
        fromClassName: classes.name,
        fromClassTime: sql<string>`(
          SELECT ${classes.startsAt} FROM ${classes}
          WHERE ${classes.id} = ${reschedules.fromClassId}
        )`,
        fromClassRoom: sql<string>`(
          SELECT ${classes.room} FROM ${classes}
          WHERE ${classes.id} = ${reschedules.fromClassId}
        )`,
        toClassName: sql<string>`(
          SELECT ${classes.name} FROM ${classes}
          WHERE ${classes.id} = ${reschedules.toClassId}
        )`,
        toClassTime: sql<string>`(
          SELECT ${classes.startsAt} FROM ${classes}
          WHERE ${classes.id} = ${reschedules.toClassId}
        )`,
        toClassRoom: sql<string>`(
          SELECT ${classes.room} FROM ${classes}
          WHERE ${classes.id} = ${reschedules.toClassId}
        )`,
      })
      .from(reschedules)
      .innerJoin(classes, eq(reschedules.fromClassId, classes.id))
      .where(eq(reschedules.userId, ctx.user.id))
      .orderBy(desc(reschedules.rescheduledAt));
  }),

  validateReschedule: protectedProcedure
    .input(rescheduleInput)
    .query(({ ctx, input }) =>
      validateReschedule(ctx.db, ctx.user.id, input.fromBookingId, input.toClassId),
    ),
});
