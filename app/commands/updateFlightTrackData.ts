import type { Prisma } from '@prisma/client';

import { fetchFlightTrackData as fetchAdsbExchangeData } from '../data/adsbExchange';
import { fetchFlightTrackData as fetchPlaneSpottersData } from '../data/planeSpotters';
import { prisma } from '../db';
import type { FlightWithData } from './types';
import { getGroupedFlightsKey } from './utils';

export const updateFlightTrackData = async (
  flights: FlightWithData[],
): Promise<void> => {
  if (process.env.FLIGHT_TRACKLOG_DATASOURCE === 'flightstats') {
    return;
  }
  console.log(
    `Updating flight track data for ${getGroupedFlightsKey(flights[0])}...`,
  );
  const tracklog =
    process.env.FLIGHT_TRACKLOG_DATASOURCE === 'adsbexchange'
      ? await fetchAdsbExchangeData(flights[0])
      : process.env.FLIGHT_TRACKLOG_DATASOURCE === 'planespotters'
        ? await fetchPlaneSpottersData(flights[0])
        : undefined;
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
};
