import { add, isAfter, isBefore, sub } from 'date-fns';

import { calculateDistance, getDurationMinutes } from '../../utils';
import { fetchFlightTrackData as fetchAdsbExchangeData } from '../adsbExchange';
import { type FlightStatsFlightUpdateData } from '../flightStats';
import { fetchFlightTrackData as fetchPlaneSpottersData } from '../planeSpotters';
import type { FlightWithData, TracklogItem } from '../types';
import {
  createNewDate,
  getGroupedFlightsKey,
  getMinutesToArrival,
} from '../utils';

export const getProjectedTakeoffTime = (
  flight: FlightWithData,
  tracklog: TracklogItem[],
  outTimeActual: Date,
): Date => {
  if (tracklog.length === 0) {
    return add(outTimeActual, { minutes: 13 });
  }
  const latestItem = tracklog[tracklog.length - 1];
  const latestTimestamp = createNewDate(latestItem.timestamp);
  const distanceFromDepartureAirport = calculateDistance(
    latestItem.coord[1],
    latestItem.coord[0],
    flight.departureAirport.lat,
    flight.departureAirport.lon,
  );
  if (
    latestItem.ground === true &&
    isBefore(new Date(), add(latestTimestamp, { minutes: 30 })) &&
    distanceFromDepartureAirport <= 5
  ) {
    if (
      flight.offTimeActual === null ||
      getDurationMinutes({ start: new Date(), end: flight.offTimeActual }) <= 1
    ) {
      return add(flight.offTimeActual ?? new Date(), { minutes: 5 });
    }
    return flight.offTimeActual;
  }
  return add(outTimeActual, { minutes: 13 });
};

export const getProjectedLandingTime = (
  flight: FlightWithData,
  tracklog: TracklogItem[],
): Date => {
  return add(new Date(), { minutes: getMinutesToArrival(flight, tracklog) });
};

export type FlightTrackUpdateData = Awaited<
  ReturnType<typeof getFlightTrackDataUpdate>
>;

export const getFlightTrackDataUpdate = async (
  flights: FlightWithData[],
  flightStatsUpdate?: FlightStatsFlightUpdateData,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const flightDataString = getGroupedFlightsKey(flights[0]);
  console.log(`Fetching flight track data for ${flightDataString}...`);
  let tracklog: TracklogItem[] | undefined;
  if (process.env.DATASOURCE_ADSBEXCHANGE === 'true') {
    try {
      tracklog = await fetchAdsbExchangeData(flights[0], flightStatsUpdate);
    } catch (err) {
      console.error(err);
    }
  }
  if (
    process.env.DATASOURCE_PLANESPOTTERS === 'true' &&
    tracklog === undefined
  ) {
    try {
      tracklog = await fetchPlaneSpottersData(flights[0], flightStatsUpdate);
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
      ground === true &&
      allItems.slice(index, index + 3).length === 3 &&
      allItems
        .slice(index, index + 3)
        .every(({ ground }) => ground === false) &&
      allItems.slice(index, index + 3).every(({ alt }) => alt !== null),
  );
  const firstItemOnGround = tracklog.find(
    ({ timestamp }, index, allItems) =>
      (lastItemOnGround === undefined ||
        timestamp > lastItemOnGround.timestamp) &&
      allItems.slice(index, index + 3).length === 3 &&
      allItems.slice(index, index + 3).every(({ ground }) => ground === true),
  );
  const outTimeActual =
    flightStatsUpdate?.outTimeActual ??
    flights[0].outTimeActual ??
    flightStatsUpdate?.outTime ??
    flights[0].outTime;
  const offTimeActual =
    lastItemOnGround !== undefined
      ? createNewDate(lastItemOnGround.timestamp)
      : getProjectedTakeoffTime(flights[0], tracklog, outTimeActual);
  const inTimeActual =
    flightStatsUpdate?.inTimeActual ??
    flights[0].inTimeActual ??
    flightStatsUpdate?.inTime ??
    flights[0].inTime;
  const onTimeActual =
    firstItemOnGround !== undefined
      ? createNewDate(firstItemOnGround.timestamp)
      : getProjectedLandingTime(flights[0], tracklog);
  const projectedOutTimeActual = sub(offTimeActual, { minutes: 13 });
  const projectedInTimeActual = add(onTimeActual, { minutes: 6 });
  return {
    tracklog,
    outTimeActual:
      isBefore(offTimeActual, outTimeActual) &&
      (flights[0].outTimeActual === null ||
        Math.abs(
          getDurationMinutes({
            start: flights[0].outTimeActual,
            end: projectedOutTimeActual,
          }),
        ) >= 3)
        ? projectedOutTimeActual
        : undefined,
    offTimeActual,
    onTimeActual,
    inTimeActual:
      isAfter(onTimeActual, inTimeActual) &&
      (flights[0].inTimeActual === null ||
        Math.abs(
          getDurationMinutes({
            start: flights[0].inTimeActual,
            end: projectedInTimeActual,
          }),
        ) >= 3)
        ? projectedInTimeActual
        : undefined,
  };
};
