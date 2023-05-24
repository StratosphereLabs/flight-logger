import { flight } from '@prisma/client';
import { TRPCError } from '@trpc/server';
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
): Promise<flight[]> => {
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
