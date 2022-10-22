import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC } from '../middleware';
import { getTripSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const tripsRouter = router({
  getTrip: procedure.input(getTripSchema).query(async ({ input }) => {
    const { id } = input;
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
  }),
  deleteTrips: procedure.use(verifyAdminTRPC).mutation(async () => {
    await prisma.trip.deleteMany({});
  }),
});
