import type { Airline, Flight } from '@prisma/client';
import type { FlightWithDataAirport } from '../data/types';

export type FlightWithData = Flight & {
  airline: Airline | null;
  departureAirport: FlightWithDataAirport;
  arrivalAirport: FlightWithDataAirport;
};
