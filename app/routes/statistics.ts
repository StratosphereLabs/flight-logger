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
  type RegionData,
  type RouteData,
  type SeatPositionData,
  getUserProfileStatisticsSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  calculateDistance,
  filterCustomDates,
  getDurationMinutes,
  getLongDurationString,
  getProfileFlightsWhereInput,
} from '../utils';

export const statisticsRouter = router({
  getTotals: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const [streakFlights, totalsFlights] = await prisma.$transaction([
        prisma.flight.findMany({
          where: profileFlightsWhere,
          orderBy: {
            inTime: 'desc',
          },
          select: {
            inTime: true,
            inTimeActual: true,
          },
        }),
        prisma.flight.findMany({
          where: profileFlightsWhere,
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
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
      const routeDataMap: Record<string, RouteData> = {};
      const cityPairDataMap: Record<string, RouteData> = {};
      for (const flight of flights) {
        const routeKey = `${flight.departureAirport.iata}→${flight.arrivalAirport.iata}`;
        const cityPairKey = [
          flight.departureAirport.iata,
          flight.arrivalAirport.iata,
        ]
          .sort((a, b) => a.localeCompare(b))
          .join('↔');
        if (routeDataMap[routeKey] === undefined) {
          routeDataMap[routeKey] = { route: routeKey, flights: 0 };
        }
        if (cityPairDataMap[cityPairKey] === undefined) {
          cityPairDataMap[cityPairKey] = { route: cityPairKey, flights: 0 };
        }
        routeDataMap[routeKey].flights++;
        cityPairDataMap[cityPairKey].flights++;
      }
      return {
        routeCount: Object.keys(routeDataMap).length,
        routeChartData: Object.values(routeDataMap),
        cityPairCount: Object.keys(cityPairDataMap).length,
        cityPairChartData: Object.values(cityPairDataMap),
      };
    }),
  getTopAirlines: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
        chartData: Object.values(airlineDataMap),
      };
    }),
  getTopAirports: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
      const airportDataMap: Record<string, AirportData> = {};
      for (const flight of flights) {
        const departureAirportId = flight.departureAirport.id;
        if (airportDataMap[departureAirportId] === undefined) {
          airportDataMap[departureAirportId] = {
            id: departureAirportId,
            airport: flight.departureAirport.iata,
            name: flight.departureAirport.name,
            all: 0,
            departure: 0,
            arrival: 0,
          };
        }
        airportDataMap[departureAirportId].all++;
        airportDataMap[departureAirportId].departure++;
        const arrivalAirportId = flight.arrivalAirport.id;
        if (airportDataMap[arrivalAirportId] === undefined) {
          airportDataMap[arrivalAirportId] = {
            id: arrivalAirportId,
            airport: flight.arrivalAirport.iata,
            name: flight.arrivalAirport.name,
            all: 0,
            departure: 0,
            arrival: 0,
          };
        }
        airportDataMap[arrivalAirportId].all++;
        airportDataMap[arrivalAirportId].arrival++;
      }
      return {
        count: Object.keys(airportDataMap).length,
        chartData: Object.values(airportDataMap),
      };
    }),
  getTopAircraftTypes: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
        chartData: Object.values(aircraftTypeDataMap).map(result => ({
          ...result,
          distance: Math.round(result.distance),
        })),
      };
    }),
  getTopCountries: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
      const countriesDataMap: Record<string, CountryData> = {};
      for (const flight of flights) {
        const departureCountryId = flight.departureAirport.country.id;
        const arrivalCountryId = flight.arrivalAirport.country.id;
        if (countriesDataMap[departureCountryId] === undefined) {
          countriesDataMap[departureCountryId] = {
            id: departureCountryId,
            country: flight.departureAirport.country.name,
            all: 0,
            departure: 0,
            arrival: 0,
          };
        }
        countriesDataMap[departureCountryId].all++;
        countriesDataMap[departureCountryId].departure++;
        if (countriesDataMap[arrivalCountryId] === undefined) {
          countriesDataMap[arrivalCountryId] = {
            id: arrivalCountryId,
            country: flight.arrivalAirport.country.name,
            all: 0,
            departure: 0,
            arrival: 0,
          };
        }
        if (departureCountryId !== arrivalCountryId) {
          countriesDataMap[arrivalCountryId].all++;
        }
        countriesDataMap[arrivalCountryId].arrival++;
      }
      return {
        count: Object.keys(countriesDataMap).length,
        chartData: Object.values(countriesDataMap),
      };
    }),
  getTopRegions: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
        orderBy: {
          outTime: input.status === 'completed' ? 'desc' : 'asc',
        },
        select: {
          outTime: true,
          departureAirport: {
            select: {
              region: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              region: true,
              timeZone: true,
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const regionsDataMap: Record<string, RegionData> = {};
      for (const flight of flights) {
        const departureRegionId = flight.departureAirport.region.id;
        const arrivalRegionId = flight.arrivalAirport.region.id;
        if (regionsDataMap[departureRegionId] === undefined) {
          regionsDataMap[departureRegionId] = {
            id: departureRegionId,
            region: flight.departureAirport.region.name,
            all: 0,
            departure: 0,
            arrival: 0,
          };
        }
        regionsDataMap[departureRegionId].all++;
        regionsDataMap[departureRegionId].departure++;
        if (regionsDataMap[arrivalRegionId] === undefined) {
          regionsDataMap[arrivalRegionId] = {
            id: arrivalRegionId,
            region: flight.arrivalAirport.region.name,
            all: 0,
            departure: 0,
            arrival: 0,
          };
        }
        if (departureRegionId !== arrivalRegionId) {
          regionsDataMap[arrivalRegionId].all++;
        }
        regionsDataMap[arrivalRegionId].arrival++;
      }
      return {
        count: Object.keys(regionsDataMap).length,
        chartData: Object.values(regionsDataMap),
      };
    }),
  getReasonDistribution: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
          flights: 0,
          duration: 0,
          distance: 0,
        },
        international: {
          id: "Int'l",
          label: 'International',
          flights: 0,
          duration: 0,
          distance: 0,
        },
      };
      for (const { departureAirport, arrivalAirport, duration } of flights) {
        const flightType =
          departureAirport.countryId === arrivalAirport.countryId
            ? 'domestic'
            : 'international';
        const distance = calculateDistance(
          departureAirport.lat,
          departureAirport.lon,
          arrivalAirport.lat,
          arrivalAirport.lon,
        );
        flightTypeDataMap[flightType].flights++;
        flightTypeDataMap[flightType].duration += duration;
        flightTypeDataMap[flightType].distance += distance;
      }
      return Object.values(flightTypeDataMap).map(result => ({
        ...result,
        distance: Math.round(result.distance),
      }));
    }),
  getFlightLengthDistribution: procedure
    .input(getUserProfileStatisticsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const profileFlightsWhere = getProfileFlightsWhereInput(
        input,
        ctx.user?.username,
      );
      const results = await prisma.flight.findMany({
        where: profileFlightsWhere,
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
