import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import {
  type AirlineData,
  type AircraftTypeData,
  type AirportData,
  type ClassData,
  type FlightTypeData,
  type ReasonData,
  type RouteData,
  type SeatPositionData,
  getUserTopRoutesSchema,
  getUserTopAirlinesSchema,
  getUserTopAircraftTypesSchema,
  getUserTopAirportsSchema,
  getUserSchema,
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
          reason: true,
        },
      });
      const reasonDataMap: Record<string, ReasonData> = {
        LEISURE: {
          reason: 'Leisure',
          flights: 0,
        },
        BUSINESS: {
          reason: 'Business',
          flights: 0,
        },
        CREW: {
          reason: 'Crew',
          flights: 0,
        },
      };
      for (const { reason } of results) {
        if (reason !== null) {
          reasonDataMap[reason].flights++;
        }
      }
      return Object.values(reasonDataMap);
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
          seatPosition: true,
        },
      });
      const seatPositionDataMap: Record<string, SeatPositionData> = {
        AISLE: {
          seatPosition: 'Aisle',
          flights: 0,
        },
        MIDDLE: {
          seatPosition: 'Middle',
          flights: 0,
        },
        WINDOW: {
          seatPosition: 'Window',
          flights: 0,
        },
      };
      for (const { seatPosition } of results) {
        if (seatPosition !== null) {
          seatPositionDataMap[seatPosition].flights++;
        }
      }
      return Object.values(seatPositionDataMap);
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
          class: true,
        },
      });
      const classDataMap: Record<string, ClassData> = {
        BASIC: {
          flightClass: 'Basic Economy',
          flights: 0,
        },
        ECONOMY: {
          flightClass: 'Economy',
          flights: 0,
        },
        PREMIUM: {
          flightClass: 'Premium Econ.',
          flights: 0,
        },
        BUSINESS: {
          flightClass: 'Business',
          flights: 0,
        },
        FIRST: {
          flightClass: 'First',
          flights: 0,
        },
      };
      for (const { class: flightClass } of results) {
        if (flightClass !== null) {
          classDataMap[flightClass].flights++;
        }
      }
      return Object.values(classDataMap);
    }),
  getFlightTypeDistribution: procedure
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
          departureAirport: {
            select: {
              countryId: true,
            },
          },
          arrivalAirport: {
            select: {
              countryId: true,
            },
          },
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
      for (const { departureAirport, arrivalAirport } of results) {
        const flightType =
          departureAirport.countryId === arrivalAirport.countryId
            ? 'domestic'
            : 'international';
        flightTypeDataMap[flightType].value++;
      }
      return Object.values(flightTypeDataMap);
    }),
});
