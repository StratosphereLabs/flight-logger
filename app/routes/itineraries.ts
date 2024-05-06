import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { fetchFlightData, prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addItinerarySchema,
  deleteItinerarySchema,
  getItinerarySchema,
  getUserSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  getFlightTimes,
  itinerariesIncludeObj,
  transformItineraryData,
} from '../utils';

export const itinerariesRouter = router({
  getItinerary: procedure.input(getItinerarySchema).query(async ({ input }) => {
    const itinerary = await prisma.itinerary.findUnique({
      where: {
        id: input.id,
      },
      include: itinerariesIncludeObj,
    });
    if (itinerary === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Itinerary not found.',
      });
    }
    return transformItineraryData(itinerary);
  }),
  getUserItineraries: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const itineraries = await prisma.itinerary.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
        },
        include: itinerariesIncludeObj,
        orderBy: {
          createdAt: 'desc',
        },
      });
      return itineraries.map(transformItineraryData);
    }),
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
      const data = await fetchFlightData({
        airportIds,
        airportSearchType: 'id',
        airlineIds,
        airlineSearchType: 'id',
        aircraftTypeData,
        aircraftSearchType: 'id',
      });
      const itineraryName =
        input.name?.trim() ??
        `${input.flights[0].arrivalAirport?.municipality ?? ''} trip`;
      const itinerary = await prisma.itinerary.create({
        data: {
          user:
            ctx.user !== null
              ? {
                  connect: {
                    id: ctx.user.id,
                  },
                }
              : undefined,
          name: itineraryName,
        },
      });
      await prisma.$transaction(
        input.flights.flatMap(flight => {
          if (
            flight.departureAirport === null ||
            flight.arrivalAirport === null
          )
            return [];
          const departureAirport = data.airports[flight.departureAirport.id];
          const arrivalAirport = data.airports[flight.arrivalAirport.id];
          const airline =
            flight.airline !== null ? data.airlines[flight.airline.id] : null;
          const aircraftTypes =
            flight.aircraftType !== null
              ? data.aircraftTypes[flight.aircraftType.id]
              : null;
          const { outTime, inTime, duration } = getFlightTimes({
            departureAirport,
            arrivalAirport,
            outDateISO: flight.outDateISO,
            outTimeValue: flight.outTimeValue,
            inTimeValue: flight.inTimeValue,
          });
          return prisma.itinerary_flight.create({
            data: {
              itinerary: {
                connect: {
                  id: itinerary.id,
                },
              },
              departureAirport: {
                connect: {
                  id: departureAirport.id,
                },
              },
              arrivalAirport: {
                connect: {
                  id: arrivalAirport.id,
                },
              },
              airline:
                airline !== null
                  ? {
                      connect: {
                        id: airline.id,
                      },
                    }
                  : undefined,
              aircraftType:
                aircraftTypes !== null && aircraftTypes.length > 0
                  ? {
                      connect: {
                        id: aircraftTypes[0].id,
                      },
                    }
                  : undefined,
              flightNumber: flight.flightNumber,
              outTime: outTime.toISOString(),
              inTime: inTime.toISOString(),
              duration,
            },
          });
        }),
      );
      const updatedItinerary = await prisma.itinerary.findUnique({
        where: {
          id: itinerary.id,
        },
        include: itinerariesIncludeObj,
      });
      if (updatedItinerary === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary not found.',
        });
      }
      return transformItineraryData(updatedItinerary);
    }),
  deleteItinerary: procedure
    .use(verifyAuthenticated)
    .input(deleteItinerarySchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const itinerary = await prisma.itinerary.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
        include: itinerariesIncludeObj,
      });
      if (itinerary === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary not found.',
        });
      }
      await prisma.itinerary_flight.deleteMany({
        where: {
          id: {
            in: itinerary.flights.map(({ id }) => id),
          },
        },
      });
      await prisma.itinerary.delete({
        where: {
          id,
        },
      });
      return transformItineraryData(itinerary);
    }),
});

export type ItinerariesRouter = typeof itinerariesRouter;

export type ItinerariesRouterOutput = inferRouterOutputs<ItinerariesRouter>;
