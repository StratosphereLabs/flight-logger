import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { addItinerarySchema } from '../schemas/itineraries';
import { procedure, router } from '../trpc';

export const itinerariesRouter = router({
  createItinerary: procedure
    .input(addItinerarySchema)
    .mutation(async ({ input }) => {
      const flight = await prisma.flight.findUnique({
        where: {
          id: '',
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
});
