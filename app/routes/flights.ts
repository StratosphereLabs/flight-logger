import type { airport } from '@prisma/client';
import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { Promise } from 'bluebird';
import { add, isAfter, isBefore, isEqual, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  updateFlightChangeData,
  updateFlightRegistrationData,
  updateFlightTimesData,
} from '../commands';
import { DATE_FORMAT_SHORT } from '../constants';
import { prisma, updateTripTimes } from '../db';
import { DB_PROMISE_CONCURRENCY } from '../db/seeders/constants';
import { verifyAuthenticated } from '../middleware';
import {
  addFlightSchema,
  deleteFlightSchema,
  editFlightSchema,
  getFlightChangelogSchema,
  getFlightSchema,
  getUserFlightsSchema,
  getUserMapDataSchema,
  getUserProfileFlightsSchema,
  getUserSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  type CurrentFlightDataResult,
  type FlightDataWithTimestamps,
  calculateCenterPoint,
  excludeKeys,
  fetchGravatarUrl,
  flightIncludeObj,
  getCurrentFlight,
  getDurationString,
  getFlightTimes,
  getFlightTimestamps,
  parsePaginationRequest,
  transformFlightData,
  getFromDate,
  getToDate,
  getCenterpoint,
  getHeatmap,
  getPaginatedResponse,
  getRoutes,
  transformCurrentFlightData,
} from '../utils';

export const flightsRouter = router({
  getFlight: procedure.input(getFlightSchema).query(async ({ input }) => {
    const { id } = input;
    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
      include: flightIncludeObj,
    });
    if (flight === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Flight not found.',
      });
    }
    return transformFlightData(flight);
  }),
  getFlightChangelog: procedure
    .input(getFlightChangelogSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const { id } = input;
      const [flightUpdates, itemCount] = await prisma.$transaction([
        prisma.flight_update.findMany({
          where: {
            flightId: id,
          },
          include: {
            changes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take,
        }),
        prisma.flight_update.count({
          where: {
            flightId: id,
          },
        }),
      ]);
      const results = await Promise.map(
        flightUpdates,
        async flightUpdate => {
          const changesWithData = [];
          const user =
            flightUpdate.changedByUserId !== null
              ? await prisma.user.findUnique({
                  where: {
                    id: flightUpdate.changedByUserId,
                  },
                })
              : null;
          for (const change of flightUpdate.changes) {
            switch (change.field) {
              case 'AIRCRAFT_TYPE': {
                const oldAircraft =
                  change.oldValue !== null
                    ? await prisma.aircraft_type.findUnique({
                        where: {
                          id: change.oldValue,
                        },
                      })
                    : null;
                const newAircraft =
                  change.newValue !== null
                    ? await prisma.aircraft_type.findUnique({
                        where: {
                          id: change.newValue,
                        },
                      })
                    : null;
                changesWithData.push({
                  ...change,
                  oldValue: oldAircraft,
                  newValue: newAircraft,
                });
                break;
              }
              case 'ARRIVAL_AIRPORT':
              case 'DEPARTURE_AIRPORT':
              case 'DIVERSION_AIRPORT': {
                const oldAirport =
                  change.oldValue !== null
                    ? await prisma.airport.findUnique({
                        where: {
                          id: change.oldValue,
                        },
                      })
                    : null;
                const newAirport =
                  change.newValue !== null
                    ? await prisma.airport.findUnique({
                        where: {
                          id: change.newValue,
                        },
                      })
                    : null;
                changesWithData.push({
                  ...change,
                  oldValue: oldAirport,
                  newValue: newAirport,
                });
                break;
              }
              case 'AIRLINE':
              case 'OPERATOR_AIRLINE': {
                const oldAirline =
                  change.oldValue !== null
                    ? await prisma.airline.findUnique({
                        where: {
                          id: change.oldValue,
                        },
                      })
                    : null;
                const newAirline =
                  change.newValue !== null
                    ? await prisma.airline.findUnique({
                        where: {
                          id: change.newValue,
                        },
                      })
                    : null;
                changesWithData.push({
                  ...change,
                  oldValue: oldAirline,
                  newValue: newAirline,
                });
                break;
              }
              case 'TAIL_NUMBER': {
                const oldAirframe =
                  change.oldValue !== null
                    ? await prisma.airframe.findFirst({
                        where: {
                          registration: change.oldValue,
                        },
                      })
                    : null;
                const newAirframe =
                  change.newValue !== null
                    ? await prisma.airframe.findFirst({
                        where: {
                          registration: change.newValue,
                        },
                      })
                    : null;
                changesWithData.push({
                  ...change,
                  oldValue: oldAirframe ?? change.oldValue,
                  newValue: newAirframe ?? change.newValue,
                });
                break;
              }
              default:
                changesWithData.push(change);
                break;
            }
          }
          return {
            ...flightUpdate,
            changes: changesWithData,
            changedByUser:
              user !== null
                ? {
                    avatar: fetchGravatarUrl(user.email),
                    ...excludeKeys(
                      user,
                      'admin',
                      'password',
                      'id',
                      'pushNotifications',
                      'passwordResetToken',
                      'passwordResetAt',
                    ),
                  }
                : null,
          };
        },
        {
          concurrency: DB_PROMISE_CONCURRENCY,
        },
      );
      return getPaginatedResponse({
        itemCount,
        limit,
        page,
        results,
      });
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
      return transformCurrentFlightData(flight);
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
            flightRadarStatus: flight.flightRadarStatus,
            departureTimeZone: flight.departureAirport.timeZone,
            arrivalTimeZone: flight.arrivalAirport.timeZone,
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
        currentFlight: transformFlightData(currentFlight),
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
  getFollowingFlights: procedure
    .use(verifyAuthenticated)
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        include: {
          following: true,
        },
      });
      if (user === null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found.',
        });
      }
      const followingIds = user.following.map(({ id }) => id);
      const flights = await prisma.flight.findMany({
        where: {
          userId: {
            in: [user.id, ...followingIds],
          },
          AND: [
            {
              OR: [
                {
                  inTimeActual: {
                    gt: sub(new Date(), { days: 3 }),
                  },
                },
                {
                  inTime: {
                    gt: sub(new Date(), { days: 3 }),
                  },
                },
              ],
            },
            {
              OR: [
                {
                  outTimeActual: {
                    lte: add(new Date(), { days: 3 }),
                  },
                },
                {
                  outTime: {
                    lte: add(new Date(), { days: 3 }),
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
      const result: {
        airports: Record<string, airport>;
        completedFlights: CurrentFlightDataResult[];
        currentFlights: CurrentFlightDataResult[];
        upcomingFlights: CurrentFlightDataResult[];
      } = {
        airports: {},
        completedFlights: [],
        currentFlights: [],
        upcomingFlights: [],
      };
      for (const flightResult of flights) {
        const flight = transformCurrentFlightData(flightResult);
        if (flight.flightStatus === 'Scheduled' || flight.flightStatus === '') {
          result.upcomingFlights.push(flight);
        } else if (flight.flightStatus === 'Arrived') {
          result.completedFlights.unshift(flight);
        } else {
          result.currentFlights.push(flight);
        }
        result.airports[flight.departureAirportId] = flight.departureAirport;
        result.airports[flight.arrivalAirportId] = flight.arrivalAirport;
      }
      const airports = Object.values(result.airports);
      return {
        ...result,
        centerpoint:
          airports.length > 0
            ? calculateCenterPoint(
                airports.map(({ lat, lon }) => ({ lat, lng: lon })),
              )
            : { lat: 0, lng: 0 },
      };
    }),
  addFlight: procedure
    .use(verifyAuthenticated)
    .input(addFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const [departureAirport, arrivalAirport] = await prisma.$transaction([
        prisma.airport.findUnique({
          where: {
            id: input.departureAirport?.id,
          },
        }),
        prisma.airport.findUnique({
          where: {
            id: input.arrivalAirport?.id,
          },
        }),
      ]);
      if (departureAirport === null || arrivalAirport === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Airport not found.',
        });
      }
      const { outTime, inTime, duration } = getFlightTimes({
        departureAirport,
        arrivalAirport,
        outDateISO: input.outDateISO,
        outTimeValue: input.outTimeValue,
        inTimeValue: input.inTimeValue,
      });
      const flight = await prisma.flight.create({
        data: {
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
          trip:
            input.tripId !== undefined
              ? {
                  connect: {
                    id: input.tripId,
                  },
                }
              : undefined,
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
            input.airline !== null
              ? {
                  connect: {
                    id: input.airline.id,
                  },
                }
              : undefined,
          aircraftType:
            input.aircraftType !== null
              ? {
                  connect: {
                    id: input.aircraftType.id,
                  },
                }
              : undefined,
          airframe:
            input.airframe?.type === 'existing'
              ? {
                  connect: {
                    icao24: input.airframe.icao24,
                  },
                }
              : undefined,
          flightNumber: input.flightNumber,
          tailNumber: input.airframe?.registration,
          outTime: outTime.toISOString(),
          inTime: inTime.toISOString(),
          duration,
          class: input.class,
          seatNumber: input.seatNumber,
          seatPosition: input.seatPosition,
          reason: input.reason,
          comments: input.comments,
          trackingLink: input.trackingLink,
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
        },
      });
      // await updateFlightTimesData([flight]);
      await updateFlightRegistrationData([flight]);
      await updateTripTimes(flight.tripId);
      const updatedFlight = await prisma.flight.findUnique({
        where: {
          id: flight.id,
        },
        include: flightIncludeObj,
      });
      if (updatedFlight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      return transformFlightData(updatedFlight);
    }),
  editFlight: procedure
    .use(verifyAuthenticated)
    .input(editFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const flight = await prisma.flight.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      const [departureAirport, arrivalAirport] = await prisma.$transaction([
        prisma.airport.findUnique({
          where: {
            id: input.departureAirport?.id,
          },
        }),
        prisma.airport.findUnique({
          where: {
            id: input.arrivalAirport?.id,
          },
        }),
      ]);
      if (departureAirport === null || arrivalAirport === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Airport not found.',
        });
      }
      const { outTime, inTime, duration } = getFlightTimes({
        departureAirport,
        arrivalAirport,
        outDateISO: input.outDateISO,
        outTimeValue: input.outTimeValue,
        inTimeValue: input.inTimeValue,
      });
      const clearFlightData =
        !isEqual(outTime, flight.outTime) || !isEqual(inTime, flight.inTime);
      const updatedData = {
        flightNumber: input.flightNumber,
        tailNumber: input.airframe?.registration ?? null,
        outTime,
        outTimeActual: clearFlightData ? null : undefined,
        offTime: clearFlightData ? null : undefined,
        offTimeActual: clearFlightData ? null : undefined,
        onTime: clearFlightData ? null : undefined,
        onTimeActual: clearFlightData ? null : undefined,
        inTime,
        inTimeActual: clearFlightData ? null : undefined,
        duration,
        class: input.class,
        seatNumber: input.seatNumber,
        seatPosition: input.seatPosition,
        reason: input.reason,
        comments: input.comments,
        trackingLink: input.trackingLink,
      };
      const updatedFlightData = await prisma.flight.update({
        where: {
          id,
        },
        data: {
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
          airline: {
            connect:
              input.airline !== null
                ? {
                    id: input.airline.id,
                  }
                : undefined,
            disconnect: input.airline === null ? true : undefined,
          },
          aircraftType: {
            connect:
              input.aircraftType !== null
                ? {
                    id: input.aircraftType.id,
                  }
                : undefined,
            disconnect: input.aircraftType === null ? true : undefined,
          },
          ...updatedData,
          airframe: {
            connect:
              !clearFlightData && input.airframe?.type === 'existing'
                ? {
                    icao24: input.airframe.icao24,
                  }
                : undefined,
            disconnect:
              clearFlightData || input.airframe?.type !== 'existing'
                ? true
                : undefined,
          },
          tailNumber:
            !clearFlightData && input.airframe !== null
              ? input.airframe.registration
              : null,
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      await updateFlightChangeData(
        [flight],
        {
          departureAirportId: departureAirport.id,
          arrivalAirportId: arrivalAirport.id,
          airlineId: input.airline?.id ?? null,
          aircraftTypeId: input.aircraftType?.id ?? null,
          ...updatedData,
        },
        ctx.user.id,
      );
      if (clearFlightData) {
        await updateFlightTimesData([updatedFlightData]);
        await updateFlightRegistrationData([updatedFlightData]);
        await updateTripTimes(updatedFlightData.tripId);
      }
    }),
  deleteFlight: procedure
    .use(verifyAuthenticated)
    .input(deleteFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const flight = await prisma.flight.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      const deletedFlight = await prisma.flight.delete({
        where: {
          id,
        },
        include: flightIncludeObj,
      });
      await updateTripTimes(deletedFlight.tripId);
      return transformFlightData(deletedFlight);
    }),
});

export type FlightsRouter = typeof flightsRouter;

export type FlightsRouterOutput = inferRouterOutputs<FlightsRouter>;
