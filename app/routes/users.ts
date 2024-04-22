import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { add, format, isAfter, isBefore, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_MONTH, DATE_FORMAT_SHORT } from '../constants';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addFollowerSchema,
  getUserFlightsSchema,
  getUserMapDataSchema,
  getUserProfileFlightsSchema,
  getUserSchema,
  getUsersSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  type FlightDataWithTimestamps,
  excludeKeys,
  fetchGravatarUrl,
  flightIncludeObj,
  getBearing,
  getCenterpoint,
  getCurrentFlight,
  getDurationMinutes,
  getDurationString,
  getFlightTimestamps,
  getFromDate,
  getHeatmap,
  getInFuture,
  getProjectedCoords,
  getRoutes,
  getToDate,
  itinerariesIncludeObj,
  parsePaginationRequest,
  transformFlightData,
  transformItineraryData,
  transformTripData,
  tripIncludeObj,
} from '../utils';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    if (input.username === undefined && ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const [userData, upcomingFlightCount] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          username: input?.username ?? ctx.user?.username,
        },
        include: {
          followedBy: true,
          _count: {
            select: {
              following: true,
              followedBy: true,
              flights: {
                where: {
                  inTime: {
                    lte: new Date(),
                  },
                },
              },
              trips: {
                where: {
                  inTime: {
                    lte: new Date(),
                  },
                },
              },
            },
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
    ]);
    if (userData === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }
    const isFollowing =
      userData.followedBy.find(user => user.username === ctx.user?.username) !==
      undefined;
    return {
      avatar: fetchGravatarUrl(userData.email),
      completedFlightCount: userData._count.flights,
      upcomingFlightCount,
      tripCount: userData._count.trips,
      creationDate: format(userData.createdAt, DATE_FORMAT_MONTH),
      isFollowing,
      ...excludeKeys(
        userData,
        'admin',
        'followedBy',
        'id',
        'password',
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
            include: flightIncludeObj,
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
            include: flightIncludeObj,
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
            include: flightIncludeObj,
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
          durationStringAbbreviated: getDurationString(flight.duration, true),
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
          durationStringAbbreviated: getDurationString(flight.duration, true),
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
                    lte: add(new Date(), { days: 1 }),
                  },
                },
                {
                  outTime: {
                    lte: add(new Date(), { days: 1 }),
                  },
                },
              ],
            },
          ],
        },
        include: flightIncludeObj,
        orderBy: {
          outTime: 'asc',
        },
      });
      const flight = getCurrentFlight(flights);
      if (flight === undefined) return null;
      const departureTime = flight.outTimeActual ?? flight.outTime;
      const arrivalTime = flight.inTimeActual ?? flight.inTime;
      const runwayDepartureTime =
        flight.offTimeActual ?? add(departureTime, { minutes: 10 });
      const runwayArrivalTime =
        flight.onTimeActual ?? sub(arrivalTime, { minutes: 10 });
      const hasDeparted = !getInFuture(departureTime);
      const hasTakenOff = !getInFuture(runwayDepartureTime);
      const hasArrived = !getInFuture(arrivalTime);
      const hasLanded = !getInFuture(runwayArrivalTime);
      const totalDuration = getDurationMinutes({
        start: departureTime,
        end: arrivalTime,
      });
      const flightDuration = getDurationMinutes({
        start: runwayDepartureTime,
        end: runwayArrivalTime,
      });
      const minutesToDeparture = getDurationMinutes({
        start: departureTime,
        end: new Date(),
      });
      const minutesToTakeoff = getDurationMinutes({
        start: runwayDepartureTime,
        end: new Date(),
      });
      const minutesToArrival = getDurationMinutes({
        start: new Date(),
        end: arrivalTime,
      });
      const minutesToLanding = getDurationMinutes({
        start: new Date(),
        end: runwayArrivalTime,
      });
      const currentDuration = hasDeparted
        ? !hasArrived
          ? minutesToDeparture
          : totalDuration
        : 0;
      const currentFlightDuration = hasTakenOff
        ? !hasLanded
          ? minutesToTakeoff
          : flightDuration
        : 0;
      const progress = currentDuration / totalDuration;
      const flightProgress = currentFlightDuration / flightDuration;
      const flightStatus =
        progress === 0
          ? 'Scheduled'
          : flightProgress === 0
            ? 'Departed - Taxiing'
            : flightProgress < 1
              ? 'En Route'
              : progress < 1
                ? 'Landed - Taxiing'
                : 'Arrived';
      const distanceTraveled = flightProgress * flight.distance;
      const initialHeading = getBearing(
        flight.departureAirport.lat,
        flight.departureAirport.lon,
        flight.arrivalAirport.lat,
        flight.arrivalAirport.lon,
      );
      const estimatedLocation = getProjectedCoords(
        flight.departureAirport.lat,
        flight.departureAirport.lon,
        distanceTraveled,
        initialHeading,
      );
      const estimatedHeading = getBearing(
        estimatedLocation.lat,
        estimatedLocation.lng,
        flight.arrivalAirport.lat,
        flight.arrivalAirport.lon,
      );
      const delayStatus =
        progress > 0 ? flight.arrivalDelayStatus : flight.departureDelayStatus;
      const delayValue =
        progress > 0 ? flight.arrivalDelayValue : flight.departureDelayValue;
      const delay = progress > 0 ? flight.arrivalDelay : flight.departureDelay;
      return {
        ...flight,
        minutesToDeparture,
        minutesToTakeoff,
        minutesToArrival,
        minutesToLanding,
        durationToDepartureString: getDurationString(minutesToDeparture),
        durationToDepartureAbbrString: getDurationString(
          minutesToDeparture,
          true,
        ),
        durationToArrivalString: getDurationString(minutesToArrival),
        durationToArrivalAbbrString: getDurationString(minutesToArrival, true),
        durationToTakeoffString: getDurationString(minutesToTakeoff),
        durationToLandingString: getDurationString(minutesToLanding),
        progress,
        flightProgress,
        flightStatus,
        delay,
        delayValue,
        delayStatus,
        estimatedLocation,
        estimatedHeading,
      };
    }),
  getUserCurrentRoute: procedure
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
          outTime: {
            lte: add(new Date(), { days: 1 }),
          },
          inTime: {
            gte: sub(new Date(), { days: 1 }),
          },
        },
        include: flightIncludeObj,
        orderBy: {
          outTime: 'asc',
        },
      });
      const currentFlight = getCurrentFlight(flights);
      if (currentFlight === undefined) return [];
      const sortedFlights = flights.reduce<{
        completedFlights: FlightDataWithTimestamps[];
        upcomingFlights: FlightDataWithTimestamps[];
      }>(
        (acc, flight) => {
          const timestamps = getFlightTimestamps({
            departureAirport: flight.departureAirport,
            arrivalAirport: flight.arrivalAirport,
            duration: flight.duration,
            outTime: flight.outTime,
            outTimeActual: flight.outTimeActual ?? undefined,
            inTime: flight.inTime,
            inTimeActual: flight.inTimeActual ?? undefined,
          });
          return isAfter(flight.outTime, currentFlight.outTime)
            ? {
                ...acc,
                upcomingFlights: [
                  ...acc.upcomingFlights,
                  {
                    ...flight,
                    ...timestamps,
                  },
                ],
              }
            : isBefore(flight.outTime, currentFlight.outTime)
              ? {
                  ...acc,
                  completedFlights: [
                    ...acc.completedFlights,
                    {
                      ...flight,
                      ...timestamps,
                    },
                  ],
                }
              : acc;
        },
        {
          completedFlights: [],
          upcomingFlights: [],
        },
      );
      return {
        ...sortedFlights,
        currentFlight,
      };
    }),
  getUserMapData: procedure
    .input(getUserMapDataSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const fromDate = getFromDate(input);
      const toDate = getToDate(input);
      const flights = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          outTime: {
            gte: fromDate,
            lte: toDate,
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
          include: tripIncludeObj,
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
          include: tripIncludeObj,
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
          include: tripIncludeObj,
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
        include: itinerariesIncludeObj,
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
        'admin',
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
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
        '_count',
      ),
    }));
  }),
  addFollower: procedure
    .use(verifyAuthenticated)
    .input(addFollowerSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          following: {
            connect: {
              username: input.username,
            },
          },
        },
      });
      return excludeKeys(
        updatedUser,
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      );
    }),
  removeFollower: procedure
    .use(verifyAuthenticated)
    .input(addFollowerSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          following: {
            disconnect: {
              username: input.username,
            },
          },
        },
      });
      return excludeKeys(
        updatedUser,
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      );
    }),
});

export type UsersRouter = typeof usersRouter;

export type UsersRouterOutput = inferRouterOutputs<UsersRouter>;
