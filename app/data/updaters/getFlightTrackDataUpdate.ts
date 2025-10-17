import { add, isAfter, isBefore, sub } from 'date-fns';

import { calculateDistance, getDurationMinutes } from '../../utils';
import { fetchFlightTrackData as fetchAdsbExchangeData } from '../adsbExchange';
import {
  TAXI_IN_AVERAGE_DURATION,
  TAXI_OUT_AVERAGE_DURATION,
} from '../constants';
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
    return add(outTimeActual, { minutes: TAXI_OUT_AVERAGE_DURATION });
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
    distanceFromDepartureAirport < 5
  ) {
    if (
      flight.offTimeActual === null ||
      getDurationMinutes({ start: new Date(), end: flight.offTimeActual }) <=
        0.5
    ) {
      return add(flight.offTimeActual ?? new Date(), { minutes: 5 });
    }
    return flight.offTimeActual;
  }
  return add(outTimeActual, { minutes: TAXI_OUT_AVERAGE_DURATION });
};

export const getProjectedLandingTime = (
  flight: FlightWithData,
  tracklog: TracklogItem[],
  inTimeActual: Date,
): Date => {
  if (tracklog.length === 0) {
    return sub(inTimeActual, { minutes: TAXI_IN_AVERAGE_DURATION });
  }
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
  const arrivalAirport =
    flights[0].diversionAirport ?? flights[0].arrivalAirport;
  const lastItemOnGround = tracklog.find(
    ({ ground, coord }, index, allItems) =>
      ground === true &&
      calculateDistance(
        flights[0].departureAirport.lat,
        flights[0].departureAirport.lon,
        coord[1],
        coord[0],
      ) < 5 &&
      allItems.slice(index, index + 3).length === 3 &&
      allItems
        .slice(index, index + 3)
        .every(({ ground }) => ground === false) &&
      allItems.slice(index, index + 3).every(({ alt }) => alt !== null),
  );
  const firstItemOnGround = tracklog.find(
    ({ ground, coord }) =>
      ground === true &&
      calculateDistance(
        coord[1],
        coord[0],
        arrivalAirport.lat,
        arrivalAirport.lon,
      ) < 5,
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
  const estimatedFlightDuration =
    getDurationMinutes({ start: outTimeActual, end: inTimeActual }) -
    TAXI_OUT_AVERAGE_DURATION -
    TAXI_IN_AVERAGE_DURATION;
  const shouldUseProjectedLandingTime = isAfter(
    new Date(),
    add(offTimeActual, { minutes: 20 }),
  );
  const onTimeActual =
    firstItemOnGround !== undefined
      ? createNewDate(firstItemOnGround.timestamp)
      : shouldUseProjectedLandingTime
        ? getProjectedLandingTime(flights[0], tracklog, inTimeActual)
        : add(offTimeActual, { minutes: estimatedFlightDuration });
  const projectedOutTimeActual = sub(offTimeActual, {
    minutes: TAXI_OUT_AVERAGE_DURATION,
  });
  const projectedInTimeActual = add(onTimeActual, {
    minutes: TAXI_IN_AVERAGE_DURATION,
  });
  const shouldUpdateOutTimeActual =
    isBefore(offTimeActual, outTimeActual) &&
    (flights[0].outTimeActual === null ||
      Math.abs(
        getDurationMinutes({
          start: flights[0].outTimeActual,
          end: projectedOutTimeActual,
        }),
      ) >= 3);
  const shouldUpdateInTimeActual =
    isAfter(new Date(), offTimeActual) &&
    isAfter(projectedInTimeActual, inTimeActual) &&
    (flights[0].inTimeActual === null ||
      Math.abs(
        getDurationMinutes({
          start: flights[0].inTimeActual,
          end: projectedInTimeActual,
        }),
      ) >= 3);
  return {
    tracklog,
    outTimeActual: shouldUpdateOutTimeActual
      ? projectedOutTimeActual
      : undefined,
    offTimeActual,
    onTimeActual,
    inTimeActual: shouldUpdateInTimeActual ? projectedInTimeActual : undefined,
  };
};
