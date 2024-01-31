import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { isEqual } from 'date-fns';
import { updateFlightTimesData } from '../commands/updateFlightTimesData';
import { updateFlightRegistrationData } from '../commands/updateFlightRegistrationData';
import { prisma, updateTripTimes } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addFlightSchema,
  deleteFlightSchema,
  editFlightSchema,
  getFlightSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  flightIncludeObj,
  getFlightTimes,
  transformFlightData,
} from '../utils';

export const flightsRouter = router({
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
        departureTimeZone: departureAirport.timeZone,
        arrivalTimeZone: arrivalAirport.timeZone,
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
      await updateFlightTimesData([flight]);
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
        departureTimeZone: departureAirport.timeZone,
        arrivalTimeZone: arrivalAirport.timeZone,
        outDateISO: input.outDateISO,
        outTimeValue: input.outTimeValue,
        inTimeValue: input.inTimeValue,
      });
      const clearFlightData =
        !isEqual(outTime, flight.outTime) || !isEqual(inTime, flight.inTime);
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
          flightNumber: input.flightNumber,
          tailNumber:
            !clearFlightData && input.airframe !== null
              ? input.airframe.registration
              : null,
          outTime: outTime.toISOString(),
          outTimeActual: clearFlightData ? null : undefined,
          offTime: clearFlightData ? null : undefined,
          offTimeActual: clearFlightData ? null : undefined,
          onTime: clearFlightData ? null : undefined,
          onTimeActual: clearFlightData ? null : undefined,
          inTime: inTime.toISOString(),
          inTimeActual: clearFlightData ? null : undefined,
          duration,
          class: input.class,
          seatNumber: input.seatNumber,
          seatPosition: input.seatPosition,
          reason: input.reason,
          comments: input.comments,
          trackingLink: input.trackingLink,
        },
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });
      if (clearFlightData) {
        await updateFlightTimesData([updatedFlightData]);
        await updateFlightRegistrationData([updatedFlightData]);
        await updateTripTimes(updatedFlightData.tripId);
      }
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
