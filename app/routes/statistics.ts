import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import {
  type AirlineData,
  type AircraftTypeData,
  type AirportData,
  type RouteData,
  getUserTopRoutesSchema,
  getUserTopAirlinesSchema,
  getUserTopAircraftTypesSchema,
  getUserTopAirportsSchema,
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
        include: {
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
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airline: true,
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
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      const { skip, take } = parsePaginationRequest(input);
      const airportDataMap: Record<string, AirportData> = {};
      for (const flight of results) {
        if (input.mode === 'all' || input.mode === 'departure') {
          const departureAirportId = flight.departureAirportId;
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
          const arrivalAirportId = flight.arrivalAirportId;
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
        include: {
          aircraftType: true,
          airframe: {
            include: {
              aircraftType: true,
            },
          },
          arrivalAirport: true,
          departureAirport: true,
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
});
