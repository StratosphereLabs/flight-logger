import { fetchFlightTrackData as fetchAdsbExchangeData } from '../adsbExchange';
import { fetchFlightTrackData as fetchPlaneSpottersData } from '../planeSpotters';
import type { FlightWithData, TracklogItem } from '../types';
import { getGroupedFlightsKey } from '../utils';

export type FlightTrackUpdateData = Awaited<
  ReturnType<typeof getFlightTrackDataUpdate>
>;

export const getFlightTrackDataUpdate = async (
  flights: FlightWithData[],
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const flightDataString = getGroupedFlightsKey(flights[0]);
  console.log(`Fetching flight track data for ${flightDataString}...`);
  let tracklog: TracklogItem[] | undefined;
  if (process.env.DATASOURCE_ADSBEXCHANGE === 'true') {
    try {
      tracklog = await fetchAdsbExchangeData(flights[0]);
    } catch (err) {
      console.error(err);
    }
  }
  if (
    process.env.DATASOURCE_PLANESPOTTERS === 'true' &&
    tracklog === undefined
  ) {
    try {
      tracklog = await fetchPlaneSpottersData(flights[0]);
    } catch (err) {
      console.error(err);
    }
  }
  if (tracklog === undefined) {
    console.log(`  Flight track data not found for ${flightDataString}.`);
    return null;
  }
  return {
    tracklog,
    offTimeActual: undefined,
    onTimeActual: undefined,
  };
};
