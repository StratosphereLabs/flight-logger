import type { Airline, Airport } from '@prisma/client';

import type { FlightTimestampsResult } from '../utils';

export interface FlightWithDataAirport {
  iata: string;
  timeZone: string;
}

export interface FetchFlightsByFlightNumberParams {
  airline: Airline;
  customUrl?: string;
  flightNumber: number;
  isoDate: string;
}

export interface FetchFlightDataParams
  extends Omit<FetchFlightsByFlightNumberParams, 'customUrl'> {
  arrivalIata: string;
  departureIata: string;
  fetchTrackingData?: boolean;
}

export interface FlightSearchDataFetchResult {
  outTime: Date;
  inTime: Date;
  airline: Airline;
  flightNumber: number;
  departureAirport: Airport;
  arrivalAirport: Airport;
}

export interface FlightSearchDataResult
  extends FlightSearchDataFetchResult,
    FlightTimestampsResult {
  id: number;
  outTimeDate: string;
  outTimeDateAbbreviated: string;
}
