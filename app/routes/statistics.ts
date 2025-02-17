import { TRPCError } from '@trpc/server';

import { prisma } from '../db';
import { getUserProfileStatisticsSchema } from '../schemas';
import { procedure, router } from '../trpc';
import {
  filterCustomDates,
  getClassData,
  getFlightLengthData,
  getFlightTypeData,
  getOnTimeStreak,
  getProfileFlightsWhereInput,
  getReasonDistributionData,
  getSeatPositionData,
  getTopAircraftTypes,
  getTopAirlines,
  getTopAirports,
  getTopCountries,
  getTopRegions,
  getTopRoutes,
  getTotals,
} from '../utils';

export const statisticsRouter = router({
  getBasicStatistics: procedure
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
          inTime: 'desc',
        },
        select: {
          outTime: true,
          airline: {
            select: {
              id: true,
              name: true,
              iata: true,
              icao: true,
            },
          },
          aircraftType: {
            select: {
              id: true,
              icao: true,
              name: true,
            },
          },
          airframe: {
            select: {
              aircraftType: {
                select: {
                  id: true,
                  icao: true,
                  name: true,
                },
              },
            },
          },
          departureAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
              lat: true,
              lon: true,
              timeZone: true,
              country: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          arrivalAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
              lat: true,
              lon: true,
              timeZone: true,
              country: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          diversionAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
              lat: true,
              lon: true,
              country: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          duration: true,
          inTime: true,
          inTimeActual: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const onTimeStreak = getOnTimeStreak(flights);
      const totals = getTotals(flights);
      const topAirlines = getTopAirlines(flights);
      const topAirports = getTopAirports(flights);
      const topAircraftTypes = getTopAircraftTypes(flights);
      const topCountries = getTopCountries(flights);
      return {
        onTimeStreak,
        totals,
        topAirlines,
        topAirports,
        topAircraftTypes,
        topCountries,
      };
    }),
  getAllStatistics: procedure
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
          inTime: 'desc',
        },
        select: {
          outTime: true,
          departureAirport: {
            select: {
              countryId: true,
              iata: true,
              lat: true,
              lon: true,
              timeZone: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          arrivalAirport: {
            select: {
              countryId: true,
              iata: true,
              lat: true,
              lon: true,
              timeZone: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          diversionAirport: {
            select: {
              countryId: true,
              iata: true,
              lat: true,
              lon: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          duration: true,
          reason: true,
          class: true,
          seatPosition: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const topRegions = getTopRegions(flights);
      const topRoutes = getTopRoutes(flights);
      const flightTypeData = getFlightTypeData(flights);
      const flightLengthData = getFlightLengthData(flights);
      const classData = getClassData(flights);
      const reasonData = getReasonDistributionData(flights);
      const seatPositionData = getSeatPositionData(flights);
      return {
        topRegions,
        topRoutes,
        flightTypeData,
        flightLengthData,
        classData,
        reasonData,
        seatPositionData,
      };
    }),
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
      const flights = await prisma.flight.findMany({
        where: profileFlightsWhere,
        orderBy: {
          inTime: 'desc',
        },
        select: {
          outTime: true,
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
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          duration: true,
          inTime: true,
          inTimeActual: true,
        },
      });
      const filteredFlights = flights.filter(filterCustomDates(input));
      const onTimeStreak = getOnTimeStreak(filteredFlights);
      const totals = getTotals(filteredFlights);
      return {
        ...totals,
        onTimeStreak,
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
          departureAirport: {
            select: {
              iata: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              iata: true,
              timeZone: true,
            },
          },
          diversionAirport: {
            select: {
              iata: true,
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getTopRoutes(flights);
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
          departureAirport: {
            select: {
              timeZone: true,
              lat: true,
              lon: true,
            },
          },
          arrivalAirport: {
            select: {
              timeZone: true,
              lat: true,
              lon: true,
            },
          },
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          airline: {
            select: {
              id: true,
              name: true,
              iata: true,
              icao: true,
            },
          },
          duration: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getTopAirlines(flights);
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
          departureAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
              timeZone: true,
            },
          },
          diversionAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getTopAirports(flights);
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
          aircraftType: {
            select: {
              id: true,
              icao: true,
              name: true,
            },
          },
          airframe: {
            select: {
              aircraftType: {
                select: {
                  id: true,
                  icao: true,
                  name: true,
                },
              },
            },
          },
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
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          duration: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getTopAircraftTypes(flights);
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
              country: {
                select: {
                  id: true,
                  name: true,
                },
              },
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              country: {
                select: {
                  id: true,
                  name: true,
                },
              },
              timeZone: true,
            },
          },
          diversionAirport: {
            select: {
              country: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getTopCountries(flights);
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
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
              timeZone: true,
            },
          },
          arrivalAirport: {
            select: {
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
              timeZone: true,
            },
          },
          diversionAirport: {
            select: {
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      return getTopRegions(flights);
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
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          reason: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const reasonData = getReasonDistributionData(flights);
      return reasonData.map(result => ({
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
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          seatPosition: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const seatPositionData = getSeatPositionData(flights);
      return seatPositionData.map(result => ({
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
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
          class: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const classData = getClassData(flights);
      return classData.map(result => ({
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
          diversionAirport: {
            select: {
              countryId: true,
              lat: true,
              lon: true,
            },
          },
          duration: true,
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const flightTypeData = getFlightTypeData(flights);
      return flightTypeData.map(result => ({
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
          diversionAirport: {
            select: {
              lat: true,
              lon: true,
            },
          },
        },
      });
      const flights = results.filter(filterCustomDates(input));
      const flightLengthData = getFlightLengthData(flights);
      return flightLengthData.map(result => ({
        ...result,
        distance: Math.round(result.distance),
      }));
    }),
});
