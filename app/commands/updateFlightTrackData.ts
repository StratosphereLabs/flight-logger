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
  const flightDataString = getGroupedFlightsKey(flights[0]);
  console.log(`Fetching flight track data for ${flightDataString}...`);
  const tracklog =
    process.env.FLIGHT_TRACKLOG_DATASOURCE === 'adsbexchange'
      ? await fetchAdsbExchangeData(flights[0])
      : process.env.FLIGHT_TRACKLOG_DATASOURCE === 'planespotters'
        ? await fetchPlaneSpottersData(flights[0])
        : undefined;
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
