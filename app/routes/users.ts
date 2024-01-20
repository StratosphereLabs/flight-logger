import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { add, format, isAfter, isBefore, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_MONTH, DATE_FORMAT_SHORT } from '../constants';
import { prisma } from '../db';
import {
  getUserFlightsSchema,
  getUserProfileFlightsSchema,
  getUserSchema,
  getUsersSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  excludeKeys,
  fetchGravatarUrl,
  getCenterpoint,
  getDurationMinutes,
  getDurationString,
  getFlightTimestamps,
  getHeatmap,
  getInFuture,
  getRoutes,
  parsePaginationRequest,
  transformFlightData,
  transformItineraryData,
  transformTripData,
} from '../utils';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    if (input.username === undefined && ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const [userData, completedFlightCount, upcomingFlightCount, tripCount] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: {
            username: input?.username ?? ctx.user?.username,
          },
        }),
        prisma.flight.count({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              lte: new Date(),
            },
          },
        }),
        prisma.flight.count({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            outTime: {
              gt: new Date(),
            },
          },
        }),
        prisma.trip.count({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              lte: new Date(),
            },
          },
        }),
      ]);
    if (userData === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }
    return {
      avatar: fetchGravatarUrl(userData.email),
      completedFlightCount,
      upcomingFlightCount,
      tripCount,
      creationDate: format(userData.createdAt, DATE_FORMAT_MONTH),
      ...excludeKeys(
        userData,
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      ),
    };
  }),
  getUserFlights: procedure
    .input(getUserFlightsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const includeObj = {
        user: true,
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
        aircraftType: true,
        airframe: {
          include: {
            aircraftType: true,
            operator: true,
          },
        },
      };
      const [upcomingFlights, currentFlights, completedFlights] =
        await prisma.$transaction([
          prisma.flight.findMany({
            where: {
              user: {
                username: input?.username ?? ctx.user?.username,
              },
              tripId: input?.withTrip === false ? null : undefined,
              outTime: {
                gt: new Date(),
              },
            },
            include: includeObj,
            orderBy: {
              outTime: input.layout === 'full' ? 'asc' : 'desc',
            },
          }),
          prisma.flight.findMany({
            where: {
              user: {
                username: input?.username ?? ctx.user?.username,
              },
              tripId: input?.withTrip === false ? null : undefined,
              inTime: {
                gt: new Date(),
              },
              outTime: {
                lte: new Date(),
              },
            },
            include: includeObj,
            orderBy: {
              outTime: input.layout === 'full' ? 'asc' : 'desc',
            },
          }),
          prisma.flight.findMany({
            where: {
              user: {
                username: input?.username ?? ctx.user?.username,
              },
              tripId: input?.withTrip === false ? null : undefined,
              inTime: {
                lte: new Date(),
              },
            },
            include: includeObj,
            orderBy: {
              outTime: 'desc',
            },
          }),
        ]);
      return {
        upcomingFlights: upcomingFlights.map(transformFlightData),
        currentFlights: currentFlights.map(transformFlightData),
        completedFlights: completedFlights.map(transformFlightData),
        total:
          upcomingFlights.length +
          currentFlights.length +
          completedFlights.length,
      };
    }),
  getUserCompletedFlights: procedure
    .input(getUserProfileFlightsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const whereObj = {
        user: {
          username: input?.username ?? ctx.user?.username,
        },
        inTime: {
          lte: new Date(),
        },
      };
      const { skip, take } = parsePaginationRequest(input);
      const [results, count] = await prisma.$transaction([
        prisma.flight.findMany({
          where: whereObj,
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airline: true,
            aircraftType: true,
          },
          skip,
          take,
          orderBy: {
            outTime: 'desc',
          },
        }),
        prisma.flight.count({
          where: whereObj,
        }),
      ]);
      return {
        results: results.map(flight => ({
          ...flight,
          outTimeDate: formatInTimeZone(
            flight.outTime,
            flight.departureAirport.timeZone,
            DATE_FORMAT_SHORT,
          ),
          durationString: getDurationString(flight.duration),
        })),
        count,
      };
    }),
  getUserUpcomingFlights: procedure
    .input(getUserProfileFlightsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const whereObj = {
        user: {
          username: input?.username ?? ctx.user?.username,
        },
        outTime: {
          gt: new Date(),
        },
      };
      const { skip, take } = parsePaginationRequest(input);
      const [results, count] = await prisma.$transaction([
        prisma.flight.findMany({
          where: whereObj,
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airline: true,
            aircraftType: true,
          },
          skip,
          take,
          orderBy: {
            outTime: 'asc',
          },
        }),
        prisma.flight.count({
          where: whereObj,
        }),
      ]);
      return {
        results: results.map(flight => ({
          ...flight,
          outTimeDate: formatInTimeZone(
            flight.outTime,
            flight.departureAirport.timeZone,
            DATE_FORMAT_SHORT,
          ),
          durationString: getDurationString(flight.duration),
        })),
        count,
      };
    }),
  getUserCurrentFlight: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const flights = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          AND: [
            {
              OR: [
                {
                  inTimeActual: {
                    gt: sub(new Date(), { hours: 12 }),
                  },
                },
                {
                  inTime: {
                    gt: sub(new Date(), { hours: 12 }),
                  },
                },
              ],
            },
            {
              OR: [
                {
                  outTimeActual: {
                    lte: add(new Date(), { hours: 12 }),
                  },
                },
                {
                  outTime: {
                    lte: add(new Date(), { hours: 12 }),
                  },
                },
              ],
            },
          ],
        },
        include: {
          departureAirport: {
            include: {
              region: true,
            },
          },
          arrivalAirport: {
            include: {
              region: true,
            },
          },
          airline: true,
          aircraftType: true,
          airframe: {
            include: {
              aircraftType: true,
            },
          },
        },
        orderBy: {
          outTime: 'asc',
        },
      });
      const flight = flights.find((currentFlight, index, allFlights) => {
        const departureTime =
          currentFlight.outTimeActual ?? currentFlight.outTime;
        const arrivalTime = currentFlight.inTimeActual ?? currentFlight.inTime;
        if (
          isBefore(departureTime, new Date()) &&
          isAfter(arrivalTime, new Date())
        ) {
          return true;
        }
        const nextFlight = allFlights[index + 1];
        if (nextFlight === undefined) return true;
        const nextFlightTime = nextFlight.outTimeActual ?? nextFlight.outTime;
        const midTime = new Date(
          (arrivalTime.getTime() + nextFlightTime.getTime()) / 2,
        );
        return isAfter(midTime, new Date());
      });
      if (flight === undefined) return null;
      const departureTime = flight.outTimeActual ?? flight.outTime;
      const arrivalTime = flight.inTimeActual ?? flight.inTime;
      const hasDeparted = !getInFuture(departureTime);
      const hasArrived = !getInFuture(arrivalTime);
      const totalDuration = getDurationMinutes({
        start: departureTime,
        end: arrivalTime,
      });
      const minutesToDeparture = getDurationMinutes({
        start: departureTime,
        end: new Date(),
      });
      const minutesToArrival = getDurationMinutes({
        start: new Date(),
        end: arrivalTime,
      });
      const currentDuration = hasDeparted
        ? !hasArrived
          ? minutesToDeparture
          : totalDuration
        : 0;
      const timestamps = getFlightTimestamps({
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        duration: flight.duration,
        outTime: flight.outTime,
        outTimeActual: flight.outTimeActual ?? undefined,
        inTime: flight.inTime,
        inTimeActual: flight.inTimeActual ?? undefined,
      });
      return {
        ...flight,
        ...timestamps,
        minutesToDeparture,
        minutesToArrival,
        durationToDepartureString: getDurationString(minutesToDeparture),
        durationToArrivalString: getDurationString(minutesToArrival),
        progress: currentDuration / totalDuration,
      };
    }),
  getUserMapData: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const flights = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      return {
        centerpoint: getCenterpoint(flights),
        heatmap: getHeatmap(flights),
        routes: getRoutes(flights),
      };
    }),
  getUserTrips: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    if (input.username === undefined && ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const includeObj = {
      user: true,
      flights: {
        include: {
          user: true,
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
          aircraftType: true,
          airframe: {
            include: {
              operator: true,
            },
          },
        },
        orderBy: {
          outTime: 'asc' as const,
        },
      },
    };
    const [upcomingTrips, currentTrips, completedTrips] =
      await prisma.$transaction([
        prisma.trip.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            outTime: {
              gt: new Date(),
            },
          },
          include: includeObj,
          orderBy: {
            outTime: 'asc',
          },
        }),
        prisma.trip.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              gt: new Date(),
            },
            outTime: {
              lte: new Date(),
            },
          },
          include: includeObj,
          orderBy: {
            outTime: 'asc',
          },
        }),
        prisma.trip.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              lte: new Date(),
            },
          },
          include: includeObj,
          orderBy: {
            outTime: 'desc',
          },
        }),
      ]);
    return {
      upcomingTrips: upcomingTrips.map(transformTripData),
      currentTrips: currentTrips.map(transformTripData),
      completedTrips: completedTrips.map(transformTripData),
      total: upcomingTrips.length + currentTrips.length + completedTrips.length,
    };
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
        include: {
          flights: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
              airline: true,
              aircraftType: true,
            },
            orderBy: {
              outTime: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return itineraries.map(transformItineraryData);
    }),
  getUsers: procedure.input(getUsersSchema).query(async ({ input }) => {
    const results = await prisma.user.findMany({
      take: 5,
      where: {
        username: {
          contains: input.query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        flights: {
          _count: 'desc',
        },
      },
    });
    return results.map(user => ({
      id: user.username,
      ...excludeKeys(
        user,
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      ),
    }));
  }),
  searchUsers: procedure.input(getUsersSchema).query(async ({ input }) => {
    const results = await prisma.user.findMany({
      take: 10,
      where: {
        username: {
          contains: input.query,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: {
            flights: {
              where: {
                inTime: {
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
      orderBy: {
        flights: {
          _count: 'desc',
        },
      },
    });
    return results.map(user => ({
      id: user.username,
      avatar: fetchGravatarUrl(user.email),
      numFlights: user._count.flights,
      ...excludeKeys(
        user,
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
        '_count',
      ),
    }));
  }),
});

export type UsersRouter = typeof usersRouter;

export type UsersRouterOutput = inferRouterOutputs<UsersRouter>;
