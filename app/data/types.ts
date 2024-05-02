import type { airline } from '@prisma/client';

export interface FlightWithDataAirport {
  iata: string;
  timeZone: string;
}

export interface FetchFlightsByFlightNumberParams {
  airline: airline;
  customUrl?: string;
  flightNumber: number;
  isoDate: string;
}

export interface FetchFlightDataParams
  extends Omit<FetchFlightsByFlightNumberParams, 'customUrl'> {
  arrivalIata: string;
  departureIata: string;
}
