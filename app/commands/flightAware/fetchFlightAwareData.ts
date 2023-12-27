import axios from 'axios';
import { load } from 'cheerio';
import { HEADERS } from '../constants';
import { type FlightWithData } from '../updateData';
import type { FlightAwareDataResponse } from './types';

export const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

export const fetchFlightAwareData = async (
  flight: FlightWithData,
): Promise<FlightAwareDataResponse | null> => {
  const url = `https://www.flightaware.com/live/flight/${flight.airline?.icao}${flight.flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = load(response.data);
  let flightData: FlightAwareDataResponse | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      flightData = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').slice(0, -1),
      ) as FlightAwareDataResponse;
    }
  });
  return flightData;
};
