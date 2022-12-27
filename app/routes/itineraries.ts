import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { fetchData } from '../parsers/fetchData';
import { getItineraryData, ItineraryResult } from '../parsers/itineraries';
import { addItinerarySchema, getItinerarySchema } from '../schemas/itineraries';
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
  getItinerary: procedure.input(getItinerarySchema).query(async ({ input }) => {
    const itinerary = await prisma.itinerary.findUnique({
      where: {
        id: input.id,
      },
    });
    if (itinerary === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Itinerary not found',
      });
    }
    return {
      ...itinerary,
      flights: JSON.parse(itinerary?.flights) as ItineraryResult[],
    };
  }),
});
