import type { Prisma } from '@prisma/client';

import { fetchFlightTrackData } from '../data/planeSpotters';
import { prisma } from '../db';
import type { FlightWithData } from './types';
import { getGroupedFlightsKey } from './utils';

export const updateFlightTrackData = async (
  flights: FlightWithData[],
): Promise<void> => {
  if (process.env.PLANESPOTTERS_FLIGHT_TRACKS === 'true') {
    console.log(
      `Updating flight track data for ${getGroupedFlightsKey(flights[0])}...`,
    );
    const tracklog = await fetchFlightTrackData(flights[0]);
    await prisma.$transaction(
      flights.map(({ id }) =>
        prisma.flight.update({
          where: {
            id,
          },
          data: {
            tracklog: tracklog as Prisma.JsonArray | undefined,
          },
        }),
      ),
    );
  }
};
