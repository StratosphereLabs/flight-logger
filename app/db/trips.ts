import { flight } from '@prisma/client';
import { prisma } from './prisma';

export const updateTripAfterEditFlight = async (
  flight: flight,
): Promise<void> => {
  if (flight.tripId !== null) {
    const trip = await prisma.trip.findUnique({
      where: {
        id: flight.tripId,
      },
      include: {
        flights: true,
      },
    });
    if (trip !== null) {
      await prisma.trip.update({
        where: {
          id: flight.tripId,
        },
        data: {
          outTime: trip.flights[0].outTime,
          inTime: trip.flights[trip.flights.length - 1].inTime,
        },
      });
    }
  }
};
