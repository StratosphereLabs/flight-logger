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
