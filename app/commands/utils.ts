import type { Prisma } from '@prisma/client';
import { isDate, isEqual } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../constants';
import type { FlightWithData } from './types';

export const getGroupedFlightsKey = ({
  airline,
  arrivalAirportId,
  departureAirport,
  departureAirportId,
  flightNumber,
  outTime,
}: FlightWithData): string => {
  const date = formatInTimeZone(
    outTime,
    departureAirport.timeZone,
    DATE_FORMAT_ISO,
  );
  return `${airline?.icao}${flightNumber} ${date} ${departureAirportId}-${arrivalAirportId}`;
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
