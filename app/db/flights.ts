import { type Flight } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { add, isAfter, isBefore, sub } from 'date-fns';

import { prisma } from './prisma';

export const deleteAllUserFlights = async (userId: number): Promise<number> => {
  const result = await prisma.flight.deleteMany({
    where: {
      userId,
    },
  });
  return result.count;
};

export const validateUserFlights = async (
  flightIds: string[],
  userId: number,
): Promise<Flight[]> => {
  const flights = await prisma.flight.findMany({
    where: {
      id: {
        in: flightIds,
      },
      userId,
    },
    orderBy: [
      {
        outTime: 'asc',
      },
    ],
  });
  if (flights.length !== flightIds.length) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'One or more flights could not be found!',
    });
  }
  flights.forEach(flight => {
    if (flight.tripId !== null) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more flights already belongs to a trip.',
      });
    }
  });
  return flights;
};

export const deleteTrackedAircraftFlights = async (
  airframeId: string,
  outTime: Date,
  outTimeActual: Date | null,
): Promise<void> => {
  const trackedAircraftFlights = await prisma.flight.findMany({
    where: {
      userId: null,
      airframeId,
      AND: [
        {
          OR: [
            {
              inTimeActual: {
                lte: outTimeActual ?? outTime,
              },
            },
            {
              inTime: {
                lte: outTimeActual ?? outTime,
              },
            },
          ],
        },
        {
          OR: [
            {
              outTimeActual: {
                gte: sub(outTime, { days: 1 }),
              },
            },
            {
              outTime: {
                gte: sub(outTime, { days: 1 }),
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      outTime: true,
      outTimeActual: true,
      inTime: true,
      inTimeActual: true,
    },
  });
  const userFlights = await prisma.flight.findMany({
    where: {
      userId: {
        not: null,
      },
      airframeId,
      AND: [
        {
          OR: [
            {
              inTimeActual: {
                lte: add(outTimeActual ?? outTime, { days: 1 }),
              },
            },
            {
              inTime: {
                lte: add(outTimeActual ?? outTime, { days: 1 }),
              },
            },
          ],
        },
        {
          OR: [
            {
              outTimeActual: {
                gte: sub(outTime, { days: 1 }),
              },
            },
            {
              outTime: {
                gte: sub(outTime, { days: 1 }),
              },
            },
          ],
        },
      ],
    },
    select: {
      outTime: true,
      outTimeActual: true,
    },
  });
  const idsToDelete: string[] = [];
  for (const trackedFlight of trackedAircraftFlights) {
    if (
      !userFlights.some(
        userFlight =>
          isBefore(
            trackedFlight.inTimeActual ?? trackedFlight.inTime,
            userFlight.outTimeActual ?? userFlight.outTime,
          ) &&
          isAfter(
            trackedFlight.outTimeActual ?? trackedFlight.outTime,
            sub(userFlight.outTime, {
              days: 1,
            }),
          ),
      )
    ) {
      idsToDelete.push(trackedFlight.id);
    }
  }
  await prisma.flight.deleteMany({
    where: {
      id: {
        in: idsToDelete,
      },
    },
  });
};
