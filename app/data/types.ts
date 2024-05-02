import type { airline } from '@prisma/client';

export interface FlightWithDataAirport {
  iata: string;
  timeZone: string;
}

export interface FetchDataParams {
  airline: airline;
  customUrl?: string;
  flightNumber: number;
  isoDate: string;
}
