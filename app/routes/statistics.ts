import { TRPCError } from '@trpc/server';
import { isBefore } from 'date-fns';

import { METERS_IN_MILE } from '../constants';
import { prisma } from '../db';
import {
  type AircraftTypeData,
  type AirlineData,
  type AirportData,
  type ClassData,
  type CountryData,
  type FlightLengthData,
  type FlightTypeData,
  type ReasonData,
  type RouteData,
  type SeatPositionData,
  getStatisticsBarGraphSchema,
  getStatisticsDistributionSchema,
  getUserFlightTypesSchema,
  getUserTopAircraftTypesSchema,
  getUserTopAirlinesSchema,
  getUserTopAirportsSchema,
  getUserTopCountriesSchema,
  getUserTopRoutesSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  calculateDistance,
  filterCustomDates,
  getDurationMinutes,
  getFromDate,
  getFromStatusDate,
  getLongDurationString,
  getSearchQueryWhereInput,
  getToDate,
  getToStatusDate,
  parsePaginationRequest,
} from '../utils';

export const statisticsRouter = router({
  getTotals: procedure
    .input(getStatisticsBarGraphSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const fromDate = getFromDate(input);
      const toDate = getToDate(input);
      const fromStatusDate = getFromStatusDate(input);
      const toStatusDate = getToStatusDate(input);
      const [streakFlights, totalsFlights] = await prisma.$transaction([
        prisma.flight.findMany({
          where: {
            user: {
              username: input?.username ?? ctx.user?.username,
            },
            inTime: {
              lte: new Date(),
            },
          },
          orderBy: {
            inTime: 'desc',
          },
          select: {
            inTime: true,
            inTimeActual: true,
          },
        }),
        prisma.flight.findMany({
          where: {
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
          },
          select: {
            outTime: true,
            departureAirport: true,
            arrivalAirport: true,
            diversionAirport: true,
            duration: true,
            inTime: true,
            inTimeActual: true,
          },
        }),
      ]);
      let onTimeStreak = 0;
      for (const flight of streakFlights) {
        if (flight.inTimeActual !== null) {
          const arrivalDelay = isBefore(flight.inTime, flight.inTimeActual)
            ? getDurationMinutes({
                start: flight.inTime,
                end: flight.inTimeActual,
              })
            : 0;
          if (arrivalDelay > 15) {
            break;
          }
          onTimeStreak++;
        }
      }
      let totalDistanceMi = 0;
      let totalDuration = 0;
      let totalFlights = 0;
      let onTimeFlights = 0;
      let flightsWithInTimeActual = 0;
      for (const flight of totalsFlights) {
        if (!filterCustomDates(input)(flight)) {
          continue;
        }
        totalFlights++;
        const distanceMi = calculateDistance(
          flight.departureAirport.lat,
          flight.departureAirport.lon,
          flight.diversionAirport?.lat ?? flight.arrivalAirport.lat,
          flight.diversionAirport?.lon ?? flight.arrivalAirport.lon,
        );
        totalDistanceMi += distanceMi;
        totalDuration += flight.duration;
        if (flight.inTimeActual !== null) {
          flightsWithInTimeActual++;
          const arrivalDelay = isBefore(flight.inTime, flight.inTimeActual)
            ? getDurationMinutes({
                start: flight.inTime,
                end: flight.inTimeActual,
              })
            : 0;
          if (arrivalDelay <= 15) {
            onTimeFlights++;
          }
        }
      }
      const totalDistanceKm = totalDistanceMi * (METERS_IN_MILE / 1000);
      return {
        onTimeStreak,
        totalDistanceMi: Math.round(totalDistanceMi),
        totalDistanceKm: Math.round(totalDistanceKm),
        totalDuration: getLongDurationString(totalDuration),
        totalDurationDays: (totalDuration / 1440).toFixed(2),
        totalFlights,
        onTimePercentage:
          flightsWithInTimeActual > 0
            ? ((100 * onTimeFlights) / flightsWithInTimeActual).toFixed(1)
            : '-.-',
      };
    }),
  getTopRoutes: procedure
    .input(getUserTopRoutesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
        select: {
          outTime: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const { skip, take } = parsePaginationRequest(input);
      const routeDataMap: Record<string, RouteData> = {};
      for (const flight of flights) {
        const key = input.cityPairs
          ? [flight.departureAirport.iata, flight.arrivalAirport.iata]
              .sort((a, b) => a.localeCompare(b))
              .join('↔')
          : `${flight.departureAirport.iata}→${flight.arrivalAirport.iata}`;
        if (routeDataMap[key] === undefined) {
          routeDataMap[key] = { route: key, flights: 0 };
        }
        routeDataMap[key].flights++;
      }
      return {
        count: Object.keys(routeDataMap).length,
        chartData: Object.values(routeDataMap)
          .sort((a, b) => b.flights - a.flights)
          .slice(skip, skip + take)
          .reverse(),
      };
    }),
  getTopAirlines: procedure
    .input(getUserTopAirlinesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
        select: {
          outTime: true,
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
          duration: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const { skip, take } = parsePaginationRequest(input);
      const airlineDataMap: Record<string, AirlineData> = {};
      for (const flight of flights) {
        if (flight.airline === null) continue;
        const key =
          flight.airline.iata !== null ? `${flight.airline.iata}/` : '';
        const airlineKey = `${key}${flight.airline.icao}`;
        if (airlineDataMap[airlineKey] === undefined) {
          airlineDataMap[airlineKey] = {
            id: flight.airline.id,
            airline: airlineKey,
            name: flight.airline.name,
            flights: 0,
            distance: 0,
            duration: 0,
          };
        }
        const distance = calculateDistance(
          flight.departureAirport.lat,
          flight.departureAirport.lon,
          flight.arrivalAirport.lat,
          flight.arrivalAirport.lon,
        );
        const airlineData = airlineDataMap[airlineKey];
        airlineData.flights++;
        airlineData.distance += distance;
        airlineData.duration += flight.duration;
      }
      return {
        count: Object.keys(airlineDataMap).length,
        chartData: Object.values(airlineDataMap)
          .sort((a, b) => {
            if (input.mode === 'distance') return b.distance - a.distance;
            if (input.mode === 'duration') return b.duration - a.duration;
            return b.flights - a.flights;
          })
          .slice(skip, skip + take)
          .map(result => ({
            ...result,
            distance: Math.round(result.distance),
          }))
          .reverse(),
      };
    }),
  getTopAirports: procedure
    .input(getUserTopAirportsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
        select: {
          outTime: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const { skip, take } = parsePaginationRequest(input);
      const airportDataMap: Record<string, AirportData> = {};
      for (const flight of flights) {
        if (input.mode === 'all' || input.mode === 'departure') {
          const departureAirportId = flight.departureAirport.id;
          if (airportDataMap[departureAirportId] === undefined) {
            airportDataMap[departureAirportId] = {
              id: departureAirportId,
              airport: flight.departureAirport.iata,
              name: flight.departureAirport.name,
              flights: 0,
            };
          }
          airportDataMap[departureAirportId].flights++;
        }
        if (input.mode === 'all' || input.mode === 'arrival') {
          const arrivalAirportId = flight.arrivalAirport.id;
          if (airportDataMap[arrivalAirportId] === undefined) {
            airportDataMap[arrivalAirportId] = {
              id: arrivalAirportId,
              airport: flight.arrivalAirport.iata,
              name: flight.arrivalAirport.name,
              flights: 0,
            };
          }
          airportDataMap[arrivalAirportId].flights++;
        }
      }
      return {
        count: Object.keys(airportDataMap).length,
        chartData: Object.values(airportDataMap)
          .sort((a, b) => b.flights - a.flights)
          .slice(skip, skip + take)
          .reverse(),
      };
    }),
  getTopAircraftTypes: procedure
    .input(getUserTopAircraftTypesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
        select: {
          outTime: true,
          aircraftType: true,
          airframe: {
            select: {
              aircraftType: true,
            },
          },
          arrivalAirport: true,
          departureAirport: true,
          duration: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const { skip, take } = parsePaginationRequest(input);
      const aircraftTypeDataMap: Record<string, AircraftTypeData> = {};
      for (const flight of flights) {
        const aircraftType =
          flight.airframe?.aircraftType ?? flight.aircraftType;
        if (aircraftType === null) continue;
        const icao = aircraftType.icao;
        if (aircraftTypeDataMap[icao] === undefined) {
          aircraftTypeDataMap[icao] = {
            id: aircraftType.id,
            aircraftType: icao,
            name: aircraftType.name,
            flights: 0,
            distance: 0,
            duration: 0,
          };
        }
        const distance = calculateDistance(
          flight.departureAirport.lat,
          flight.departureAirport.lon,
          flight.arrivalAirport.lat,
          flight.arrivalAirport.lon,
        );
        const aircraftTypeData = aircraftTypeDataMap[icao];
        aircraftTypeData.flights++;
        aircraftTypeData.distance += distance;
        aircraftTypeData.duration += flight.duration;
      }
      return {
        count: Object.keys(aircraftTypeDataMap).length,
        chartData: Object.values(aircraftTypeDataMap)
          .sort((a, b) => {
            if (input.mode === 'distance') return b.distance - a.distance;
            if (input.mode === 'duration') return b.duration - a.duration;
            return b.flights - a.flights;
          })
          .slice(skip, skip + take)
          .map(result => ({
            ...result,
            distance: Math.round(result.distance),
          }))
          .reverse(),
      };
    }),
  getTopCountries: procedure
    .input(getUserTopCountriesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
        select: {
          outTime: true,
          departureAirport: {
            select: {
              country: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              country: true,
              timeZone: true,
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const { skip, take } = parsePaginationRequest(input);
      const countriesDataMap: Record<string, CountryData> = {};
      for (const flight of flights) {
        const departureCountryId = flight.departureAirport.country.id;
        const arrivalCountryId = flight.arrivalAirport.country.id;
        if (input.mode === 'all' || input.mode === 'departure') {
          if (countriesDataMap[departureCountryId] === undefined) {
            countriesDataMap[departureCountryId] = {
              id: departureCountryId,
              country: flight.departureAirport.country.name,
              flights: 0,
            };
          }
          countriesDataMap[departureCountryId].flights++;
        }
        if (
          (input.mode === 'all' && departureCountryId !== arrivalCountryId) ||
          input.mode === 'arrival'
        ) {
          if (countriesDataMap[arrivalCountryId] === undefined) {
            countriesDataMap[arrivalCountryId] = {
              id: arrivalCountryId,
              country: flight.arrivalAirport.country.name,
              flights: 0,
            };
          }
          countriesDataMap[arrivalCountryId].flights++;
        }
      }
      return {
        count: Object.keys(countriesDataMap).length,
        chartData: Object.values(countriesDataMap)
          .sort((a, b) => b.flights - a.flights)
          .slice(skip, skip + take)
          .reverse(),
      };
    }),
  getReasonDistribution: procedure
    .input(getStatisticsDistributionSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        select: {
          outTime: true,
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          reason: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const reasonDataMap: Record<string, ReasonData> = {
        LEISURE: {
          reason: 'Leisure',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        BUSINESS: {
          reason: 'Business',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        CREW: {
          reason: 'Crew',
          flights: 0,
          distance: 0,
          duration: 0,
        },
      };
      for (const {
        arrivalAirport,
        duration,
        departureAirport,
        reason,
      } of flights) {
        if (reason !== null) {
          const distance = calculateDistance(
            departureAirport.lat,
            departureAirport.lon,
            arrivalAirport.lat,
            arrivalAirport.lon,
          );
          reasonDataMap[reason].flights++;
          reasonDataMap[reason].distance += distance;
          reasonDataMap[reason].duration += duration;
        }
      }
      return Object.values(reasonDataMap).map(result => ({
        ...result,
        distance: Math.round(result.distance),
      }));
    }),
  getSeatPositionDistribution: procedure
    .input(getStatisticsDistributionSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        select: {
          outTime: true,
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          seatPosition: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const seatPositionDataMap: Record<string, SeatPositionData> = {
        AISLE: {
          seatPosition: 'Aisle',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        MIDDLE: {
          seatPosition: 'Middle',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        WINDOW: {
          seatPosition: 'Window',
          flights: 0,
          distance: 0,
          duration: 0,
        },
      };
      for (const {
        arrivalAirport,
        departureAirport,
        duration,
        seatPosition,
      } of flights) {
        if (seatPosition !== null) {
          const distance = calculateDistance(
            departureAirport.lat,
            departureAirport.lon,
            arrivalAirport.lat,
            arrivalAirport.lon,
          );
          seatPositionDataMap[seatPosition].flights++;
          seatPositionDataMap[seatPosition].distance += distance;
          seatPositionDataMap[seatPosition].duration += duration;
        }
      }
      return Object.values(seatPositionDataMap).map(result => ({
        ...result,
        distance: Math.round(result.distance),
      }));
    }),
  getClassDistribution: procedure
    .input(getStatisticsDistributionSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        select: {
          outTime: true,
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          class: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const classDataMap: Record<string, ClassData> = {
        BASIC: {
          flightClass: 'Basic Economy',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        ECONOMY: {
          flightClass: 'Economy',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        PREMIUM: {
          flightClass: 'Premium',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        BUSINESS: {
          flightClass: 'Business',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        FIRST: {
          flightClass: 'First',
          flights: 0,
          distance: 0,
          duration: 0,
        },
      };
      for (const {
        arrivalAirport,
        class: flightClass,
        departureAirport,
        duration,
      } of flights) {
        if (flightClass !== null) {
          const distance = calculateDistance(
            departureAirport.lat,
            departureAirport.lon,
            arrivalAirport.lat,
            arrivalAirport.lon,
          );
          classDataMap[flightClass].flights++;
          classDataMap[flightClass].distance += distance;
          classDataMap[flightClass].duration += duration;
        }
      }
      return Object.values(classDataMap).map(result => ({
        ...result,
        distance: Math.round(result.distance),
      }));
    }),
  getFlightTypeDistribution: procedure
    .input(getUserFlightTypesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        select: {
          outTime: true,
          departureAirport: {
            select: {
              countryId: true,
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              countryId: true,
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          duration: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const flightTypeDataMap: Record<string, FlightTypeData> = {
        domestic: {
          id: 'Domestic',
          label: 'Domestic',
          value: 0,
        },
        international: {
          id: "Int'l",
          label: 'International',
          value: 0,
        },
      };
      for (const { departureAirport, arrivalAirport, duration } of flights) {
        const flightType =
          departureAirport.countryId === arrivalAirport.countryId
            ? 'domestic'
            : 'international';
        if (input.mode === 'flights') {
          flightTypeDataMap[flightType].value++;
        } else if (input.mode === 'distance') {
          const distance = calculateDistance(
            departureAirport.lat,
            departureAirport.lon,
            arrivalAirport.lat,
            arrivalAirport.lon,
          );
          flightTypeDataMap[flightType].value += distance;
        } else if (input.mode === 'duration') {
          flightTypeDataMap[flightType].value += duration;
        }
      }
      return Object.values(flightTypeDataMap).map(result => ({
        ...result,
        value: Math.round(result.value),
      }));
    }),
  getFlightLengthDistribution: procedure
    .input(getStatisticsDistributionSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
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
        },
        select: {
          outTime: true,
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
              timeZone: true,
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const flightLengthDataMap: Record<string, FlightLengthData> = {
        short: {
          flightLength: 'Short',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        medium: {
          flightLength: 'Medium',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        long: {
          flightLength: 'Long',
          flights: 0,
          distance: 0,
          duration: 0,
        },
        ultraLong: {
          flightLength: 'Ultra Long',
          flights: 0,
          distance: 0,
          duration: 0,
        },
      };
      for (const { departureAirport, duration, arrivalAirport } of flights) {
        const flightDistance = calculateDistance(
          departureAirport.lat,
          departureAirport.lon,
          arrivalAirport.lat,
          arrivalAirport.lon,
        );
        if (duration > 960) {
          flightLengthDataMap.ultraLong.flights++;
          flightLengthDataMap.ultraLong.distance += flightDistance;
          flightLengthDataMap.ultraLong.duration += duration;
        } else if (flightDistance > 2400 && duration > 360) {
          flightLengthDataMap.long.flights++;
          flightLengthDataMap.long.distance += flightDistance;
          flightLengthDataMap.long.duration += duration;
        } else if (flightDistance > 900 && duration > 180) {
          flightLengthDataMap.medium.flights++;
          flightLengthDataMap.medium.distance += flightDistance;
          flightLengthDataMap.medium.duration += duration;
        } else {
          flightLengthDataMap.short.flights++;
          flightLengthDataMap.short.distance += flightDistance;
          flightLengthDataMap.short.duration += duration;
        }
      }
      return Object.values(flightLengthDataMap).map(result => ({
        ...result,
        distance: Math.round(result.distance),
      }));
    }),
});
