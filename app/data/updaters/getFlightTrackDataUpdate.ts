import { add, isAfter, sub } from 'date-fns';

import { SECONDS_IN_MINUTE } from '../../constants';
import {
  calculateDistance,
  getDurationMinutes,
  getEstimatedSpeedFromTracklog,
  getLatestAltitudeItem,
} from '../../utils';
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
  getDescentDuration,
  getGroupedFlightsKey,
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
  const isLatestItemStale = isAfter(
    new Date(),
    createNewDate(latestItem.timestamp + 15 * SECONDS_IN_MINUTE),
  );
  const distanceFromDepartureAirport = calculateDistance(
    latestItem.coord[1],
    latestItem.coord[0],
    flight.departureAirport.lat,
    flight.departureAirport.lon,
  );
  if (
    (latestItem.ground !== true && latestItem.alt !== null) ||
    isLatestItemStale ||
    distanceFromDepartureAirport > 5
  ) {
    return add(outTimeActual, { minutes: TAXI_OUT_AVERAGE_DURATION });
  }
  if (
    flight.offTimeActual === null ||
    getDurationMinutes({ start: new Date(), end: flight.offTimeActual }) <= 0.5
  ) {
    return add(flight.offTimeActual ?? new Date(), { minutes: 5 });
  }
  return flight.offTimeActual;
};

export const getProjectedLandingTime = (
  flight: FlightWithData,
  tracklog: TracklogItem[],
  inTimeActual: Date,
): Date => {
  const estimatedSpeed = getEstimatedSpeedFromTracklog(tracklog);
  if (
    tracklog.length === 0 ||
    estimatedSpeed === null ||
    isAfter(new Date(), inTimeActual)
  ) {
    return sub(inTimeActual, { minutes: TAXI_IN_AVERAGE_DURATION });
  }
  const latestItem = tracklog[tracklog.length - 1];
  const isLatestItemStale = isAfter(
    new Date(),
    createNewDate(latestItem.timestamp + 15 * SECONDS_IN_MINUTE),
  );
  if (isLatestItemStale) {
    return sub(inTimeActual, { minutes: TAXI_IN_AVERAGE_DURATION });
  }
  const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
  const distanceToArrivalAirport = calculateDistance(
    latestItem.coord[1],
    latestItem.coord[0],
    arrivalAirport.lat,
    arrivalAirport.lon,
  );
  const arrivalElevation = (arrivalAirport.elevation ?? 0) / 100;
  const currentAltitude =
    getLatestAltitudeItem(tracklog)?.alt ?? arrivalElevation;
  const distanceToDescend = currentAltitude - arrivalElevation;
  const descentDuration = getDescentDuration(distanceToDescend);
  const calculatedDuration =
    (distanceToArrivalAirport / (estimatedSpeed * 0.98)) * 60 +
    descentDuration * 0.4002384454;
  return createNewDate(
    latestItem.timestamp +
      SECONDS_IN_MINUTE * Math.max(calculatedDuration, descentDuration),
  );
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
      allItems.slice(index + 1, index + 4).length === 3 &&
      allItems
        .slice(index + 1, index + 4)
        .every(({ alt, ground }) => ground === false || alt !== null),
  );
  const firstItemOnGround = tracklog.find(
    ({ alt, ground, coord }) =>
      (ground === true || alt === null) &&
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
  // const projectedOutTimeActual = sub(offTimeActual, {
  //   minutes: TAXI_OUT_AVERAGE_DURATION,
  // });
  // const projectedInTimeActual = add(onTimeActual, {
  //   minutes: TAXI_IN_AVERAGE_DURATION,
  // });
  // const shouldUpdateOutTimeActual =
  //   isBefore(offTimeActual, outTimeActual) &&
  //   (flights[0].outTimeActual === null ||
  //     Math.abs(
  //       getDurationMinutes({
  //         start: flights[0].outTimeActual,
  //         end: projectedOutTimeActual,
  //       }),
  //     ) >= 3);
  // const shouldUpdateInTimeActual =
  //   isAfter(new Date(), offTimeActual) &&
  //   isAfter(projectedInTimeActual, inTimeActual) &&
  //   (flights[0].inTimeActual === null ||
  //     Math.abs(
  //       getDurationMinutes({
  //         start: flights[0].inTimeActual,
  //         end: projectedInTimeActual,
  //       }),
  //     ) >= 3);
  return {
    tracklog,
    // outTimeActual: shouldUpdateOutTimeActual
    //   ? projectedOutTimeActual
    //   : undefined,
    offTimeActual,
    onTimeActual,
    // inTimeActual: shouldUpdateInTimeActual ? projectedInTimeActual : undefined,
  };
};
