import type { airline, flight } from '@prisma/client';
import type { FlightWithDataAirport } from '../data/types';

export type FlightWithData = flight & {
  airline: airline | null;
  departureAirport: FlightWithDataAirport;
  arrivalAirport: FlightWithDataAirport;
};
