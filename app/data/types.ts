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

export interface SearchFlightsByFlightNumberParams {
  airline: Airline;
  customUrl?: string;
  flightNumber: number;
  isoDate: string;
}

export interface FetchFlightDataParams {
  airline: Airline;
  arrivalAirport: FlightWithDataAirport;
  departureAirport: FlightWithDataAirport;
  flightNumber: number;
  isoDate: string;
}

export interface FetchOnTimePerformanceDataParams {
  airlineIata: string;
  flightNumber: number;
  departureIata: string;
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
  departureMunicipalityText: string;
  arrivalMunicipalityText: string;
  outTimeDate: string;
  outTimeDateAbbreviated: string;
}
