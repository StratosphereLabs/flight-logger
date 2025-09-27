import { fetchFlightTrackData as fetchAdsbExchangeData } from '../data/adsbExchange';
import { fetchFlightTrackData as fetchPlaneSpottersData } from '../data/planeSpotters';
import type { TracklogItem } from '../data/types';
import { prisma } from '../db';
import type { FlightWithData } from './types';
import { getGroupedFlightsKey } from './utils';

export const updateFlightTrackData = async (
  flights: FlightWithData[],
): Promise<void> => {
  const flightDataString = getGroupedFlightsKey(flights[0]);
  console.log(`Fetching flight track data for ${flightDataString}...`);
  let tracklog: TracklogItem[] | undefined;
  if (process.env.DATASOURCE_ADSBEXCHANGE === 'true') {
    tracklog = await fetchAdsbExchangeData(flights[0]);
  }
  if (
    process.env.DATASOURCE_PLANESPOTTERS === 'true' &&
    tracklog === undefined
  ) {
    tracklog = await fetchPlaneSpottersData(flights[0]);
  }
  if (tracklog === undefined) {
    console.log(`  Flight track data not found for ${flightDataString}.`);
    return;
  }
  await prisma.$transaction(
    flights.map(({ id }) =>
      prisma.flight.update({
        where: {
          id,
        },
        data: {
          tracklog,
        },
      }),
    ),
  );
};
