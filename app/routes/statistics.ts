import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import {
  type AirlineData,
  type AircraftTypeData,
  type AirportData,
  type ClassData,
  type FlightLengthData,
  type FlightTypeData,
  type ReasonData,
  type RouteData,
  type SeatPositionData,
  getUserTopRoutesSchema,
  getUserTopAirlinesSchema,
  getUserTopAircraftTypesSchema,
  getUserTopAirportsSchema,
  getUserSchema,
  getUserFlightTypesSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { calculateDistance, parsePaginationRequest } from '../utils';

export const statisticsRouter = router({
  getTopRoutes: procedure
    .input(getUserTopRoutesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        select: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      const routeDataMap: Record<string, RouteData> = {};
      for (const flight of results) {
        const key = input.cityPairs
          ? [flight.departureAirport.iata, flight.arrivalAirport.iata]
              .sort((a, b) => a.localeCompare(b))
              .join('-')
          : `${flight.departureAirport.iata}-${flight.arrivalAirport.iata}`;
        if (routeDataMap[key] === undefined) {
          routeDataMap[key] = { route: key, flights: 0 };
        }
        routeDataMap[key].flights++;
      }
      return Object.values(routeDataMap)
        .sort((a, b) => b.flights - a.flights)
        .slice(skip, skip + take)
        .reverse();
    }),
  getTopAirlines: procedure
    .input(getUserTopAirlinesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        select: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
          duration: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      const airlineDataMap: Record<string, AirlineData> = {};
      for (const flight of results) {
        if (flight.airline === null) continue;
        const key =
          flight.airline.iata !== null ? `${flight.airline.iata}/` : '';
        const airlineKey = `${key}${flight.airline.icao}`;
        if (airlineDataMap[airlineKey] === undefined) {
          airlineDataMap[airlineKey] = {
            id: flight.airline.id,
            airline: airlineKey,
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
      return Object.values(airlineDataMap)
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
        .reverse();
    }),
  getTopAirports: procedure
    .input(getUserTopAirportsSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        select: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      const airportDataMap: Record<string, AirportData> = {};
      for (const flight of results) {
        if (input.mode === 'all' || input.mode === 'departure') {
          const departureAirportId = flight.departureAirport.id;
          if (airportDataMap[departureAirportId] === undefined) {
            airportDataMap[departureAirportId] = {
              id: departureAirportId,
              airport: flight.departureAirport.iata,
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
              flights: 0,
            };
          }
          airportDataMap[arrivalAirportId].flights++;
        }
      }
      return Object.values(airportDataMap)
        .sort((a, b) => b.flights - a.flights)
        .slice(skip, skip + take)
        .reverse();
    }),
  getTopAircraftTypes: procedure
    .input(getUserTopAircraftTypesSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        orderBy: {
          outTime: 'desc',
        },
        select: {
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
      const { skip, take } = parsePaginationRequest(input);
      const aircraftTypeDataMap: Record<string, AircraftTypeData> = {};
      for (const flight of results) {
        const aircraftType =
          flight.airframe?.aircraftType ?? flight.aircraftType;
        if (aircraftType === null) continue;
        const icao = aircraftType.icao;
        if (aircraftTypeDataMap[icao] === undefined) {
          aircraftTypeDataMap[icao] = {
            id: aircraftType.id,
            aircraftType: icao,
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
      return Object.values(aircraftTypeDataMap)
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
        .reverse();
    }),
  getReasonDistribution: procedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        select: {
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          reason: true,
        },
      });
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
      } of results) {
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
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        select: {
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          seatPosition: true,
        },
      });
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
      } of results) {
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
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        select: {
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          class: true,
        },
      });
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
          flightClass: 'Premium Econ.',
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
      } of results) {
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
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        select: {
          departureAirport: {
            select: {
              countryId: true,
              lat: true,
              lon: true,
            },
          },
          arrivalAirport: {
            select: {
              countryId: true,
              lat: true,
              lon: true,
            },
          },
          duration: true,
        },
      });
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
      for (const { departureAirport, arrivalAirport, duration } of results) {
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
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const results = await prisma.flight.findMany({
        where: {
          user: {
            username: input?.username ?? ctx.user?.username,
          },
          inTime: {
            lte: new Date(),
          },
        },
        select: {
          duration: true,
          departureAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          arrivalAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
        },
      });
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
      for (const { departureAirport, duration, arrivalAirport } of results) {
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
