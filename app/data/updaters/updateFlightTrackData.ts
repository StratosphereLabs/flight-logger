import { prisma } from '../../db';
import type { FlightWithData } from '../types';
import { getFlightTrackDataUpdate } from './getFlightTrackDataUpdate';

export const updateFlightTrackData = async (
  flights: FlightWithData[],
): Promise<void> => {
  const flightTrackUpdate = await getFlightTrackDataUpdate(flights);
  if (flightTrackUpdate !== null) {
    await prisma.$transaction(
      flights.map(({ id }) =>
        prisma.flight.update({
          where: {
            id,
          },
          data: flightTrackUpdate,
        }),
      ),
    );
  }
};
