import type { Airline } from '@prisma/client';
import axios from 'axios';
import { load } from 'cheerio';

import { HEADERS } from '../constants';
import type { FlightWithDataAirport } from '../types';

export interface FetchPlaneMapperDataParams {
  airline: Airline;
  arrivalAirport: FlightWithDataAirport;
  departureAirport: FlightWithDataAirport;
  flightNumber: number;
  isoDate: string;
}

export const fetchPlaneMapperData = async ({
  airline,
  arrivalAirport,
  departureAirport,
  flightNumber,
  isoDate,
}: FetchPlaneMapperDataParams): Promise<void> => {
  const url = `https://www.planemapper.com/flights/${
    airline.iata ?? airline.icao
  }${flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = load(response.data);
  console.log($);
};
