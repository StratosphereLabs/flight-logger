import type { Airline, Airport } from '@prisma/client';

import type { FlightTimestampsResult } from '../utils';
import type { FlightAwareTracklogItem } from './flightAware/types';

export interface FlightWithDataAirport {
  id: string;
  iata: string;
  timeZone: string;
}

export type TracklogItem = Pick<
  FlightAwareTracklogItem,
  'timestamp' | 'coord' | 'alt' | 'gs'
>;

export interface FetchFlightsByFlightNumberParams {
  airline: Airline;
  customUrl?: string;
  flightNumber: number;
  isoDate: string;
}

export interface FetchOnTimePerformanceDataParams {
  airlineIata: string;
  flightNumber: number;
  departureIata: string;
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
