import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { fetchData } from '../parsers/fetchData';
import { getItineraryData } from '../parsers/itineraries';
import { addItinerarySchema } from '../schemas/itineraries';
import { procedure, router } from '../trpc';

export const itinerariesRouter = router({
  createItinerary: procedure
    .input(addItinerarySchema)
    .mutation(async ({ input }) => {
      if (input.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Please add at least one flight',
        });
      }
      const airportIds = [
        ...new Set(
          input.flatMap(flight => [
            flight.departureAirportId,
            flight.arrivalAirportId,
          ]),
        ),
      ];
      const airlineIds = [
        ...new Set(
          input.flatMap(flight =>
            flight.airlineId !== null ? [flight.airlineId] : [],
          ),
        ),
      ];
      const aircraftTypeData = [
        ...new Set(
          input.flatMap(flight =>
            flight.aircraftTypeId !== null ? [flight.aircraftTypeId] : [],
          ),
        ),
      ];
      const data = await fetchData({
        airportIds,
        airlineIds,
        aircraftTypeData,
        aircraftSearchType: 'id',
      });
      const itineraryData = getItineraryData({ input, data });
      return await prisma.itinerary.create({
        data: {
          flights: JSON.stringify(itineraryData),
        },
      });
    }),
});
