import { prisma } from './prisma';

export const updateTripTimes = async (tripId: string | null): Promise<void> => {
  if (tripId !== null) {
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        flights: {
          orderBy: {
            outTime: 'asc',
          },
        },
      },
    });
    if (trip !== null && trip.flights.length > 0) {
      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          outTime: trip.flights[0].outTime,
          inTime: trip.flights[trip.flights.length - 1].inTime,
        },
      });
    }
  }
};
