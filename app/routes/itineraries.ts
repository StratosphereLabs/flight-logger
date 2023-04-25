import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import { fetchData } from '../parsers/fetchData';
import { getItineraryData, ItineraryResult } from '../parsers/itineraries';
import {
  addItinerarySchema,
  deleteItinerarySchema,
  getItinerarySchema,
} from '../schemas/itineraries';
import { procedure, router } from '../trpc';

export const itinerariesRouter = router({
  createItinerary: procedure
    .input(addItinerarySchema)
    .mutation(async ({ input, ctx }) => {
      const airportIds = [
        ...new Set(
          input.flights.flatMap(flight =>
            flight.departureAirport !== null && flight.arrivalAirport !== null
              ? [flight.departureAirport.id, flight.arrivalAirport.id]
              : [],
          ),
        ),
      ];
      const airlineIds = [
        ...new Set(
          input.flights.flatMap(flight =>
            flight.airline !== null ? [flight.airline.id] : [],
          ),
        ),
      ];
      const aircraftTypeData = [
        ...new Set(
          input.flights.flatMap(flight =>
            flight.aircraftType !== null ? [flight.aircraftType.id] : [],
          ),
        ),
      ];
      const data = await fetchData({
        airportIds,
        airlineIds,
        aircraftTypeData,
        aircraftSearchType: 'id',
      });
      const itineraryData = getItineraryData({ flights: input.flights, data });
      const itineraryName =
        input.name?.trim() ??
        `${itineraryData
          .map(({ arrivalAirport }) => arrivalAirport.municipality)
          .join(', ')} trip`;
      return await prisma.itinerary.create({
        data: {
          userId: ctx.user?.id,
          name: itineraryName,
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
  deleteItinerary: procedure
    .use(verifyAuthenticated)
    .input(deleteItinerarySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const flight = await prisma.itinerary.findFirst({
        where: {
          id,
        },
      });
      if (flight?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unable to delete itinerary.',
        });
      }
      return await prisma.itinerary.delete({
        where: {
          id,
        },
      });
    }),
});
