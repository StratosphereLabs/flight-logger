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
  const userFlightRanges = userFlights.map(userFlight => {
    const end = userFlight.outTimeActual ?? userFlight.outTime;
    const start = sub(end, { days: 1 });
    return { start, end };
  });
  const idsToDelete: string[] = [];
  for (const trackedFlight of trackedAircraftFlights) {
    const trackedStart = trackedFlight.outTimeActual ?? trackedFlight.outTime;
    const trackedEnd = trackedFlight.inTimeActual ?? trackedFlight.inTime;
    let userFlightExists = false;
    for (const { start, end } of userFlightRanges) {
      if (isAfter(trackedStart, start) && isBefore(trackedEnd, end)) {
        userFlightExists = true;
        break;
      }
    }
    if (!userFlightExists) {
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
