import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { getTripSchema } from '../schemas';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const tripsRouter = router({
  getTrip: publicProcedure.input(getTripSchema).query(async ({ input }) => {
    const { id } = input;
    try {
      const trip = await prisma.trip.findUnique({
        where: {
          id,
        },
      });
      if (trip === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found.',
        });
      }
      return trip;
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
        cause: err,
      });
    }
  }),
  deleteTrips: adminProcedure.mutation(async () => {
    try {
      await prisma.trip.deleteMany({});
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
        cause: err,
      });
    }
  }),
});
