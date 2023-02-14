import { TRPCError } from '@trpc/server';
import { prisma } from '../db';
import { verifyAdminTRPC, verifyAuthenticated } from '../middleware';
import {
  addFlightSchema,
  deleteFlightSchema,
  editFlightSchema,
  getFlightSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { getFlightTimes } from '../utils';

export const flightsRouter = router({
  addFlight: procedure
    .use(verifyAuthenticated)
    .input(addFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const [departureAirport, arrivalAirport] = await prisma.$transaction([
        prisma.airport.findUnique({
          where: {
            id: input.departureAirportId,
          },
        }),
        prisma.airport.findUnique({
          where: {
            id: input.arrivalAirportId,
          },
        }),
      ]);
      if (departureAirport === null || arrivalAirport === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Airport not found.',
        });
      }
      const { outTime, offTime, onTime, inTime, duration } = getFlightTimes({
        departureAirport,
        arrivalAirport,
        outDate: input.outDate,
        outTime: input.outTime,
        offTime: input.offTime,
        onTime: input.onTime,
        inTime: input.inTime,
      });
      const flight = await prisma.flight.create({
        data: {
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
          departureAirport: {
            connect: {
              id: input.departureAirportId,
            },
          },
          arrivalAirport: {
            connect: {
              id: input.arrivalAirportId,
            },
          },
          airline:
            input.airlineId !== null && input.airlineId !== ''
              ? {
                  connect: {
                    id: input.airlineId,
                  },
                }
              : undefined,
          aircraftType:
            input.aircraftTypeId !== null && input.aircraftTypeId !== ''
              ? {
                  connect: {
                    id: input.aircraftTypeId,
                  },
                }
              : undefined,
          flightNumber: input.flightNumber,
          callsign: input.callsign,
          tailNumber: input.tailNumber,
          outTime: outTime.toISOString(),
          offTime: offTime?.toISOString() ?? null,
          onTime: onTime?.toISOString() ?? null,
          inTime: inTime.toISOString(),
          duration,
          class: input.class,
          seatNumber: input.seatNumber,
          seatPosition: input.seatPosition,
          reason: input.reason,
          comments: input.comments,
          trackingLink: input.trackingLink,
        },
      });
      return flight;
    }),
  getFlight: procedure.input(getFlightSchema).query(async ({ input }) => {
    const { id } = input;
    const flight = await prisma.flight.findUnique({
      where: {
        id,
      },
    });
    if (flight === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Flight not found.',
      });
    }
    return flight;
  }),
  editFlight: procedure
    .use(verifyAuthenticated)
    .input(editFlightSchema)
    .mutation(({ ctx, input }) => {
      console.log({ ctx, input });
    }),
  deleteFlight: procedure
    .use(verifyAuthenticated)
    .input(deleteFlightSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const flight = await prisma.flight.findFirst({
        where: {
          id,
        },
      });
      if (flight?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unable to delete flight.',
        });
      }
      return await prisma.flight.delete({
        where: {
          id,
        },
      });
    }),
  deleteFlights: procedure.use(verifyAdminTRPC).mutation(async () => {
    await prisma.flight.deleteMany({});
  }),
});
