import { add, isAfter, sub } from 'date-fns';

import { fetchFlightTrackData as fetchAdsbExchangeData } from '../adsbExchange';
import { fetchFlightTrackData as fetchPlaneSpottersData } from '../planeSpotters';
import type { FlightWithData, TracklogItem } from '../types';
import { getGroupedFlightsKey, getMinutesToArrival } from '../utils';

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
  const lastItemOnGround = tracklog.find(
    ({ ground }, index, allItems) =>
      ground === true && allItems[index + 1]?.ground === false,
  );
  const firstItemOnGround = tracklog.find(
    ({ ground }, index, allItems) =>
      ground === true && allItems[index - 1]?.ground === false,
  );
  const isEnRoute =
    lastItemOnGround !== undefined && firstItemOnGround === undefined;
  const minutesToArrival = getMinutesToArrival(flights[0], tracklog);
  const currentOffTimeActual =
    flights[0].offTimeActual ??
    flights[0].offTime ??
    add(flights[0].outTime, { minutes: 10 });
  const offTimeActual =
    lastItemOnGround !== undefined
      ? new Date(lastItemOnGround.timestamp)
      : isAfter(new Date(), sub(currentOffTimeActual, { minutes: 1 }))
        ? add(new Date(), { minutes: 5 })
        : undefined;
  const onTimeActual =
    firstItemOnGround !== undefined
      ? new Date(firstItemOnGround.timestamp)
      : isEnRoute
        ? add(new Date(), { minutes: minutesToArrival })
        : undefined;
  return {
    tracklog,
    offTimeActual,
    onTimeActual,
  };
};
