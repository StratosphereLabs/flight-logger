import { type FlightWithData } from './updateFlights';

export const createNewDate = (timestamp: number): Date =>
  new Date(1000 * timestamp);

export const getGroupedFlightsKey = ({
  airline,
  flightNumber,
  departureAirportId,
  arrivalAirportId,
}: FlightWithData): string =>
  `${airline?.icao}${flightNumber} ${departureAirportId}-${arrivalAirportId}`;
