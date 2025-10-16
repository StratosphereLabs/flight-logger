import type { Prisma } from '@prisma/client';
import { isDate, isEqual } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../constants';
import {
  calculateDistance,
  getEstimatedSpeedFromTracklog,
  getProjectedAltitudeFromTracklog,
} from '../utils';
import type { FlightWithData, TracklogItem } from './types';

export const createNewDate = (timestamp: number): Date =>
  new Date(1000 * timestamp);

export const getGroupedFlightsKey = ({
  airline,
  arrivalAirportId,
  departureAirport,
  departureAirportId,
  flightNumber,
  outTime,
}: Pick<
  FlightWithData,
  | 'airline'
  | 'arrivalAirportId'
  | 'departureAirportId'
  | 'departureAirport'
  | 'flightNumber'
  | 'outTime'
>): string => {
  const date = formatInTimeZone(
    outTime,
    departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  return `${airline?.icao}${flightNumber} ${date} ${departureAirportId}-${arrivalAirportId}`;
};

export const trackAircraftFlightIncludeObj = {
  airline: true,
  departureAirport: {
    select: {
      id: true,
      iata: true,
      timeZone: true,
    },
  },
  arrivalAirport: {
    select: {
      id: true,
      iata: true,
      timeZone: true,
    },
  },
  diversionAirport: {
    select: {
      id: true,
      iata: true,
      timeZone: true,
    },
  },
};

export const getIsEqual = <
  Value extends
    | string
    | number
    | Date
    | null
    | boolean
    | Prisma.JsonObject
    | Prisma.JsonArray,
>(
  a: Value,
  b: Value | undefined,
): boolean => {
  if (b === undefined || (a === null && b === null)) return true;
  return isDate(a) && isDate(b) ? isEqual(a, b) : a === b;
};

export const removeUndefined = <T extends object>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as Partial<T>;

export const getDescentDuration = (distanceToDescend: number): number => {
  if (distanceToDescend <= 0) return 0;
  return 0.5 * Math.pow(distanceToDescend, 0.68);
};

export const getMinutesToArrival = (
  flight: FlightWithData,
  tracklog: TracklogItem[],
): number => {
  const latestItem = tracklog[tracklog.length - 1];
  const arrivalAirport = flight.diversionAirport ?? flight.arrivalAirport;
  const arrivalElevation = (arrivalAirport.elevation ?? 0) / 100;
  const distanceToArrival = calculateDistance(
    latestItem.coord[1],
    latestItem.coord[0],
    arrivalAirport.lat,
    arrivalAirport.lon,
  );
  const estimatedSpeed = getEstimatedSpeedFromTracklog(tracklog);
  const projectedAltitude =
    getProjectedAltitudeFromTracklog(tracklog) ?? arrivalElevation;
  const distanceToDescend = projectedAltitude - arrivalElevation;
  // const descentDuration = getDescentDuration(distanceToDescend);
  return (
    (distanceToArrival / (estimatedSpeed * 0.98)) * 60 +
    distanceToDescend * 0.0315828279
  );
  // return (
  //   (distanceToArrival / (estimatedSpeed * 0.96)) * 60 +
  //   descentDuration * 0.43269230769
  // );
};
