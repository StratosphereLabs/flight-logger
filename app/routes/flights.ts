import type { OnTimePerformanceRating } from '@prisma/client';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { Promise } from 'bluebird';
import { add, isAfter, isBefore, isEqual, sub } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import {
  updateFlightChangeData,
  updateFlightRegistrationData,
  updateFlightTimesData,
  updateOnTimePerformanceData,
} from '../commands';
import type { FlightWithData } from '../commands/types';
import { DATE_FORMAT_SHORT, DATE_FORMAT_YEAR } from '../constants';
import { prisma, updateTripTimes } from '../db';
import { DB_PROMISE_CONCURRENCY } from '../db/seeders/constants';
import { verifyAuthenticated } from '../middleware';
import {
  addFlightSchema,
  deleteFlightSchema,
  editFlightSchema,
  getExtraFlightDataSchema,
  getFlightChangelogSchema,
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
  fetchGravatarUrl,
  filterCustomDates,
  flightIncludeObj,
  getActiveFlight,
  getCenterpoint,
  getDurationString,
  getFlightTimes,
  getFlightTimestamps,
  getFlightUpdateChangeWithData,
  getFromDate,
  getFromStatusDate,
  getHeatmap,
  getPaginatedResponse,
  getRoutes,
  getSearchQueryWhereInput,
  getToDate,
  getToStatusDate,
  getWeatherReportCloudCoverData,
  parsePaginationRequest,
  transformFlightData,
  updateFlightWeatherReports,
} from '../utils';

export const flightsRouter = router({
  getFlight: procedure
    .use(verifyAuthenticated)
    .input(getFlightSchema)
    .query(async ({ input }) => {
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
  getExtraFlightData: procedure
    .use(verifyAuthenticated)
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
      let onTimePerformance: OnTimePerformanceRating | null = null;
      if (flight.airline !== null && flight.flightNumber !== null) {
        onTimePerformance = await prisma.onTimePerformanceRating.findFirst({
          where: {
            airlineId: flight.airline.id,
            flightNumber: flight.flightNumber,
            departureAirportId: flight.departureAirportId,
            arrivalAirportId: flight.arrivalAirportId,
          },
          orderBy: {
            validTo: 'desc',
          },
        });
      }
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
  getFlightChangelog: procedure
    .use(verifyAuthenticated)
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
      const fromDate = getFromDate(input);
      const toDate = getToDate(input);
      const fromStatusDate = getFromStatusDate(input);
      const toStatusDate = getToStatusDate(input);
      const whereObj = {
        user: {
          username: input?.username ?? ctx.user?.username,
        },
        tripId: input?.withTrip === false ? null : undefined,
        outTime: {
          gte: fromDate,
          lte: toDate,
        },
        AND: [
          {
            OR:
              fromStatusDate !== undefined || toStatusDate !== undefined
                ? [
                    {
                      inTime: {
                        gte: fromStatusDate,
                        lte: toStatusDate,
                      },
                    },
                    {
                      inTimeActual: {
                        gte: fromStatusDate,
                        lte: toStatusDate,
                      },
                    },
                  ]
                : undefined,
          },
          ...(input.searchQuery.length > 0
            ? [getSearchQueryWhereInput(input.searchQuery)]
            : []),
          ...(input.selectedAirportId !== null
            ? [
                {
                  OR: [
                    {
                      departureAirportId: input.selectedAirportId,
                    },
                    {
                      arrivalAirportId: input.selectedAirportId,
                    },
                  ],
                },
              ]
            : []),
        ],
      };
      const results = await prisma.flight.findMany({
        where: whereObj,
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
      const fromDate = getFromDate(input);
      const toDate = getToDate(input);
      const fromStatusDate = getFromStatusDate(input);
      const toStatusDate = getToStatusDate(input);
      const whereObj = {
        user: {
          username: input?.username ?? ctx.user?.username,
        },
        outTime: {
          gte: fromDate,
          lte: toDate,
        },
        AND: [
          {
            OR:
              fromStatusDate !== undefined || toStatusDate !== undefined
                ? [
                    {
                      inTime: {
                        gte: fromStatusDate,
                        lte: toStatusDate,
                      },
                    },
                    {
                      inTimeActual: {
                        gte: fromStatusDate,
                        lte: toStatusDate,
                      },
                    },
                  ]
                : undefined,
          },
          ...(input.searchQuery.length > 0
            ? [getSearchQueryWhereInput(input.searchQuery)]
            : []),
          ...(input.selectedAirportId !== null
            ? [
                {
                  OR: [
                    {
                      departureAirportId: input.selectedAirportId,
                    },
                    {
                      arrivalAirportId: input.selectedAirportId,
                    },
                  ],
                },
              ]
            : []),
        ],
      };
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const results = await prisma.flight.findMany({
        where: whereObj,
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
      if (
        ctx.user === null &&
        (input.username === undefined || input.status !== 'completed')
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const fromDate = getFromDate(input);
      const toDate = getToDate(input);
      const fromStatusDate = getFromStatusDate(input);
      const toStatusDate = getToStatusDate(input);
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          outTime: {
            gte: fromDate,
            lte: toDate,
          },
          AND: [
            ...(fromStatusDate !== undefined || toStatusDate !== undefined
              ? [
                  {
                    OR: [
                      {
                        inTime: {
                          gte: fromStatusDate,
                          lte: toStatusDate,
                        },
                      },
                      {
                        inTimeActual: {
                          gte: fromStatusDate,
                          lte: toStatusDate,
                        },
                      },
                    ],
                  },
                ]
              : []),
            ...(input.searchQuery.length > 0
              ? [getSearchQueryWhereInput(input.searchQuery)]
              : []),
          ],
        },
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
          flight.flightStatus === 'SCHEDULED' ||
          flight.flightStatus === 'CANCELED'
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
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          diversionAirport: true,
          airline: true,
        },
      });
      const updatedFlights = await updateFlightRegistrationData([flight]);
      await updateTripTimes(flight.tripId);
      await updateOnTimePerformanceData(updatedFlights ?? [flight]);
      await updateFlightWeatherReports(updatedFlights ?? [flight]);
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
        flightRadarStatus: flightDataChanged ? null : undefined,
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
              !flightDataChanged && input.airframe?.type === 'existing'
                ? {
                    icao24: input.airframe.icao24,
                  }
                : undefined,
            disconnect:
              flightDataChanged || input.airframe?.type !== 'existing'
                ? true
                : undefined,
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
        let updatedTimesFlights: FlightWithData[] | null = null;
        updatedTimesFlights = await updateFlightTimesData([updatedFlight]);
        updatedTimesFlights = await updateFlightRegistrationData(
          updatedTimesFlights ?? [updatedFlight],
        );
        await updateOnTimePerformanceData(
          updatedTimesFlights ?? [updatedFlight],
        );
        await updateFlightWeatherReports(
          updatedTimesFlights ?? [updatedFlight],
        );
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
    }),
});

export type FlightsRouter = typeof flightsRouter;

export type FlightsRouterOutput = inferRouterOutputs<FlightsRouter>;
