import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC, verifyAuthenticated } from '../middleware';
import { editFlightSchema, getFlightSchema } from '../schemas';
import { procedure, router } from '../trpc';

export const flightsRouter = router({
  getFlight: procedure.input(getFlightSchema).query(async ({ input }) => {
    const { id } = input;
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
  }),
  editFlight: procedure
    .use(verifyAuthenticated)
    .input(editFlightSchema)
    .mutation(({ ctx, input }) => {
      console.log({ ctx, input });
    }),
  deleteFlights: procedure.use(verifyAdminTRPC).mutation(async () => {
    await prisma.flight.deleteMany({});
  }),
});
