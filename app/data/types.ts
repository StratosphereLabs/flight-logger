import type { airline, airport } from '@prisma/client';
import type { FlightTimestampsResult } from '../utils';

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

export interface FlightSearchDataFetchResult {
  outTime: Date;
  inTime: Date;
  airline: airline;
  flightNumber: number;
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface FlightSearchDataResult
  extends FlightSearchDataFetchResult,
    FlightTimestampsResult {
  id: number;
  outTimeDate: string;
  outTimeDateAbbreviated: string;
}
