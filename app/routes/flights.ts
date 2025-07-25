import type { OnTimePerformanceRating } from '@prisma/client';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { Promise } from 'bluebird';
import { add, isAfter, isBefore, isEqual, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { updateFlightChangeData, updateFlightData } from '../commands';
import {
  DATE_FORMAT_MONTH_DAY,
  DATE_FORMAT_SHORT,
  DATE_FORMAT_YEAR,
} from '../constants';
import { prisma, updateTripTimes } from '../db';
import { DB_PROMISE_CONCURRENCY } from '../db/seeders/constants';
import { verifyAuthenticated } from '../middleware';
import {
  addFlightSchema,
  deleteFlightSchema,
  editFlightSchema,
  getExtraFlightDataSchema,
  getFlightChangelogSchema,
  getFlightHistorySchema,
  getFlightSchema,
  getUserFlightsSchema,
  getUserMapDataSchema,
  getUserProfileFlightsSchema,
  getUserSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  type FlightDataWithTimestamps,
  type TransformFlightDataResult,
  type UserData,
  fetchGravatarUrl,
  filterCustomDates,
  flightIncludeObj,
  getActiveFlight,
  getAirframe,
  getCenterpoint,
  getDurationString,
  getFlightTimes,
  getFlightTimestamps,
  getFlightUpdateChangeWithData,
  getHeatmap,
  getPaginatedResponse,
  getProfileFlightsWhereInput,
  getRainviewerTimestamp,
  getRoutes,
  getWeatherReportCloudCoverData,
  parsePaginationRequest,
  transformFlightData,
} from '../utils';

export const flightsRouter = router({
  getFlight: procedure.input(getFlightSchema).query(async ({ input }) => {
    const { id } = input;
    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
      include: flightIncludeObj,
      omit: {
        tracklog: false,
        waypoints: false,
      },
    });
    if (flight === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Flight not found.',
      });
    }
    const flightData = transformFlightData(flight);
    const flightState =
      flightData.flightStatus === 'SCHEDULED'
        ? 'UPCOMING'
        : flightData.flightStatus === 'ARRIVED'
          ? 'COMPLETED'
          : 'CURRENT';
    const weatherRadarTime =
      flightState === 'COMPLETED'
        ? (flightData.onTimeActual ??
          flightData.inTimeActual ??
          flightData.inTime)
        : new Date();
    const timestamp = getRainviewerTimestamp(weatherRadarTime);
    return {
      ...flightData,
      flightState,
      timestamp,
    };
  }),
  getExtraFlightData: procedure
    .input(getExtraFlightDataSchema)
    .query(async ({ input }) => {
      const flight = await prisma.flight.findUnique({
        where: {
          id: input.flightId,
        },
        include: {
          airline: true,
          departureWeather: true,
          arrivalWeather: true,
          diversionWeather: true,
        },
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      const onTimePerformance: OnTimePerformanceRating | null =
        flight.airline !== null && flight.flightNumber !== null
          ? await prisma.onTimePerformanceRating.findFirst({
              where: {
                airlineId: flight.airline.id,
                flightNumber: flight.flightNumber,
                departureAirportId: flight.departureAirportId,
                arrivalAirportId: flight.arrivalAirportId,
              },
              orderBy: {
                validTo: 'desc',
              },
            })
          : null;
      return {
        onTimePerformance:
          onTimePerformance !== null
            ? {
                ...onTimePerformance,
                averageDelay: getDurationString(
                  Math.round(onTimePerformance.mean),
                ),
                chartData: [
                  {
                    id: 'onTime',
                    label: 'On Time',
                    flights: onTimePerformance.onTime,
                  },
                  {
                    id: 'late',
                    label: 'Late >15m',
                    flights: onTimePerformance.late,
                  },
                  {
                    id: 'veryLate',
                    label: 'Very Late >30m',
                    flights: onTimePerformance.veryLate,
                  },
                  {
                    id: 'excessive',
                    label: 'Excessive >45m',
                    flights: onTimePerformance.excessive,
                  },
                  {
                    id: 'cancelled',
                    label: 'Cancelled',
                    flights: onTimePerformance.cancelled,
                  },
                  {
                    id: 'diverted',
                    label: 'Diverted',
                    flights: onTimePerformance.diverted,
                  },
                ].reverse(),
              }
            : null,
        departureWeather: getWeatherReportCloudCoverData(
          flight.departureWeather,
        ),
        arrivalWeather: getWeatherReportCloudCoverData(flight.arrivalWeather),
        diversionWeather: getWeatherReportCloudCoverData(
          flight.diversionWeather,
        ),
      };
    }),
  getFlightHistory: procedure
    .use(verifyAuthenticated)
    .input(getFlightHistorySchema)
    .query(async ({ ctx, input }) => {
      const flight = await prisma.flight.findUnique({
        where: {
          id: input.flightId,
        },
        select: {
          user: {
            select: {
              id: true,
              following: {
                select: {
                  id: true,
                },
              },
            },
          },
          tailNumber: true,
          departureAirportId: true,
          arrivalAirportId: true,
          airframeId: true,
          aircraftType: true,
          airlineId: true,
        },
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      if (input.user === 'following' && flight.user.id !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized.',
        });
      }
      const { limit, page, skip, take } = parsePaginationRequest(input);
      if (
        (input.mode === 'airline' && flight.airlineId === null) ||
        (input.mode === 'aircraftType' && flight.aircraftType === null) ||
        (input.mode === 'airframe' &&
          flight.airframeId === null &&
          flight.tailNumber === null)
      ) {
        return getPaginatedResponse({
          itemCount: 0,
          limit,
          page,
          results: [],
        });
      }
      const whereObj = {
        id: {
          not: input.flightId,
        },
        userId: {
          in:
            input.user === 'mine'
              ? [ctx.user.id]
              : input.user === 'user'
                ? [flight.user.id]
                : input.user === 'following'
                  ? flight.user.following.map(({ id }) => id)
                  : [],
        },
        OR: [
          {
            inTimeActual: {
              lte: new Date(),
            },
          },
          {
            inTime: {
              lte: new Date(),
            },
          },
        ],
        departureAirportId:
          input.mode === 'route' ? flight.departureAirportId : undefined,
        arrivalAirportId:
          input.mode === 'route' ? flight.arrivalAirportId : undefined,
        airframeId:
          input.mode === 'airframe' && flight.airframeId !== null
            ? flight.airframeId
            : undefined,
        tailNumber:
          input.mode === 'airframe' &&
          flight.airframeId === null &&
          flight.tailNumber !== null
            ? flight.tailNumber
            : undefined,
        aircraftType:
          input.mode === 'aircraftType'
            ? {
                icao: flight.aircraftType?.icao,
              }
            : undefined,
        airlineId: input.mode === 'airline' ? flight.airlineId : undefined,
      };
      const [results, itemCount] = await prisma.$transaction([
        prisma.flight.findMany({
          where: whereObj,
          include: flightIncludeObj,
          orderBy: {
            outTime: 'desc',
          },
          skip,
          take,
        }),
        prisma.flight.count({
          where: whereObj,
        }),
      ]);
      return getPaginatedResponse({
        itemCount,
        limit,
        page,
        results: results.map(result => {
          const user: UserData & {
            avatar: string;
          } = {
            ...result.user,
            avatar: fetchGravatarUrl(result.user.email),
          };
          return {
            ...transformFlightData(result),
            user,
            outTimeYear: formatInTimeZone(
              result.outTime,
              result.departureAirport.timeZone,
              DATE_FORMAT_YEAR,
            ),
            outTimeDate: formatInTimeZone(
              result.outTime,
              result.departureAirport.timeZone,
              DATE_FORMAT_MONTH_DAY,
            ),
            tracklog: null,
            waypoints: null,
          };
        }),
      });
    }),
  getFlightChangelog: procedure
    .input(getFlightChangelogSchema)
    .query(async ({ input }) => {
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const { id } = input;
      const [flightUpdates, itemCount] = await prisma.$transaction([
        prisma.flightUpdateCommit.findMany({
          where: {
            flightId: id,
          },
          include: {
            changes: true,
            departureAirport: {
              select: {
                timeZone: true,
              },
            },
            arrivalAirport: {
              select: {
                timeZone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take,
        }),
        prisma.flightUpdateCommit.count({
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
            changesWithData.push(
              await getFlightUpdateChangeWithData(
                change,
                flightUpdate.createdAt,
              ),
            );
          }
          return {
            ...flightUpdate,
            changes: changesWithData,
            changedByUser:
              user !== null
                ? {
                    avatar: fetchGravatarUrl(user.email),
                    ...user,
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
    .use(verifyAuthenticated)
    .input(getUserFlightsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: {
          ...profileFlightsWhere,
          tripId: input?.withTrip === false ? null : undefined,
        },
        include: flightIncludeObj,
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getPaginatedResponse({
        itemCount: flights.length,
        limit,
        page,
        results: flights.slice(skip, skip + take).map(transformFlightData),
      });
    }),
  getUserFlightsBasic: procedure
    .use(verifyAuthenticated)
    .input(getUserProfileFlightsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
          aircraftType: true,
          diversionAirport: true,
        },
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getPaginatedResponse({
        itemCount: flights.length,
        limit,
        page,
        results: flights.slice(skip, skip + take).map(flight => ({
          ...flight,
          outTimeYear: formatInTimeZone(
            flight.outTime,
            flight.departureAirport.timeZone,
            DATE_FORMAT_YEAR,
          ),
          outTimeDate: formatInTimeZone(
            flight.outTime,
            flight.departureAirport.timeZone,
            DATE_FORMAT_SHORT,
          ),
          tracklog: null,
          waypoints: null,
        })),
      });
    }),
  getUserActiveFlight: procedure
    .use(verifyAuthenticated)
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
        omit: {
          tracklog: false,
          waypoints: false,
        },
      });
      const flight = getActiveFlight(flights);
      if (flight === undefined) return null;
      return transformFlightData(flight);
    }),
  getUserCurrentRoute: procedure
    .use(verifyAuthenticated)
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
      const currentFlight = getActiveFlight(flights);
      if (currentFlight === undefined) return [];
      const sortedFlights = flights.reduce<{
        completedFlights: FlightDataWithTimestamps[];
        upcomingFlights: FlightDataWithTimestamps[];
      }>(
        (acc, flight) => {
          const timestamps = getFlightTimestamps({
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
      if (
        ctx.user === null &&
        (input.username === undefined || input.status !== 'completed')
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        {
          ...input,
          selectedAirportId: null,
        },
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return {
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
          following: {
            omit: {
              id: false,
            },
          },
        },
        omit: {
          id: false,
        },
      });
      if (user === null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found.',
        });
      }
      const followingIds = user.following.map(({ id }) => id);
      const flightResults = await prisma.flight.findMany({
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
        omit: {
          tracklog: false,
          waypoints: false,
        },
      });
      const flights: Array<
        TransformFlightDataResult & {
          flightState: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
        }
      > = [];
      for (const result of flightResults) {
        const flight = transformFlightData(result);
        const flightState =
          flight.flightStatus === 'SCHEDULED'
            ? 'UPCOMING'
            : flight.flightStatus === 'ARRIVED'
              ? 'COMPLETED'
              : 'CURRENT';
        flights.push({
          ...flight,
          flightState,
        });
      }
      return {
        flights,
        centerpoint: getCenterpoint(flights),
      };
    }),
  addFlight: procedure
    .use(verifyAuthenticated)
    .input(addFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const user =
        input.username !== undefined
          ? await prisma.user.findUnique({
              where: {
                username: input.username,
                followedBy: {
                  some: {
                    username: ctx.user.username,
                  },
                },
                following: {
                  some: {
                    username: ctx.user.username,
                  },
                },
              },
              omit: {
                id: false,
              },
            })
          : undefined;
      if (user === null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `Unable to add flight for user @${input.username}`,
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
      const airframe =
        input.airframe?.type === 'custom'
          ? await getAirframe(input.airframe.registration)
          : null;
      const airframeId = airframe?.icao24 ?? input.airframe?.icao24;
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
              id: user?.id ?? ctx.user.id,
            },
          },
          addedByUser:
            user !== undefined
              ? {
                  connect: {
                    id: ctx.user.id,
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
            airframeId !== undefined
              ? {
                  connect: {
                    icao24: airframeId,
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
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          diversionAirport: true,
          airline: true,
        },
      });
      await updateFlightData([flight]);
      await updateTripTimes(flight.tripId);
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
      const airframe =
        input.airframe?.type === 'custom' &&
        input.airframe.registration !== flight.tailNumber
          ? await getAirframe(input.airframe.registration)
          : null;
      const airframeId = airframe?.icao24 ?? input.airframe?.icao24;
      const { outTime, inTime, duration } = getFlightTimes({
        departureAirport,
        arrivalAirport,
        outDateISO: input.outDateISO,
        outTimeValue: input.outTimeValue,
        inTimeValue: input.inTimeValue,
      });
      const flightDataChanged =
        !isEqual(outTime, flight.outTime) ||
        !isEqual(inTime, flight.inTime) ||
        flight.airlineId !== (input.airline?.id ?? null) ||
        flight.flightNumber !== input.flightNumber ||
        flight.departureAirportId !== input.departureAirport.id ||
        flight.arrivalAirportId !== input.arrivalAirport.id;
      const updatedData = {
        flightNumber: input.flightNumber,
        tailNumber: input.airframe?.registration ?? null,
        outTime,
        outTimeActual: flightDataChanged ? null : undefined,
        offTime: flightDataChanged ? null : undefined,
        offTimeActual: flightDataChanged ? null : undefined,
        onTime: flightDataChanged ? null : undefined,
        onTimeActual: flightDataChanged ? null : undefined,
        inTime,
        inTimeActual: flightDataChanged ? null : undefined,
        duration,
        departureGate: flightDataChanged ? null : undefined,
        departureTerminal: flightDataChanged ? null : undefined,
        arrivalBaggage: flightDataChanged ? null : undefined,
        arrivalGate: flightDataChanged ? null : undefined,
        arrivalTerminal: flightDataChanged ? null : undefined,
        tracklog: flightDataChanged ? [] : undefined,
        waypoints: flightDataChanged ? [] : undefined,
        class: input.class,
        seatNumber: input.seatNumber,
        seatPosition: input.seatPosition,
        reason: input.reason,
      };
      const updatedFlight = await prisma.flight.update({
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
              !flightDataChanged && airframeId !== undefined
                ? {
                    icao24: airframeId,
                  }
                : undefined,
            disconnect:
              flightDataChanged || airframeId === undefined ? true : undefined,
          },
          tailNumber:
            !flightDataChanged && input.airframe !== null
              ? input.airframe.registration
              : null,
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
          diversionAirport: true,
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
      if (flightDataChanged) {
        await updateFlightData([updatedFlight]);
        await updateTripTimes(updatedFlight.tripId);
      }
    }),
  deleteFlight: procedure
    .use(verifyAuthenticated)
    .input(deleteFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const deleteFlightWhere = {
        id,
        OR: [
          {
            userId: ctx.user.id,
          },
          {
            addedByUserId: ctx.user.id,
          },
        ],
      };
      const flight = await prisma.flight.findFirst({
        where: deleteFlightWhere,
      });
      if (flight === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Flight not found.',
        });
      }
      const deletedFlight = await prisma.flight.delete({
        where: deleteFlightWhere,
        include: flightIncludeObj,
      });
      await updateTripTimes(deletedFlight.tripId);
    }),
});

export type FlightsRouter = typeof flightsRouter;

export type FlightsRouterOutput = inferRouterOutputs<FlightsRouter>;
