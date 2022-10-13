import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC } from '../middleware';
import { getFlightSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const flightsRouter = router({
  getFlight: procedure.input(getFlightSchema).query(async ({ input }) => {
    const { id } = input;
    try {
      const flight = await prisma.flight.findUnique({
        where: {
          id,
        },
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      return flight;
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
        cause: err,
      });
    }
  }),
  deleteFlights: procedure.use(verifyAdminTRPC).mutation(async () => {
    try {
      await prisma.flight.deleteMany({});
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
        cause: err,
      });
    }
  }),
});
