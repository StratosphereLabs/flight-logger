import axios from 'axios';
import { load } from 'cheerio';
import { HEADERS } from '../constants';
import { type FlightWithData } from '../updateData';
import type { FlightStatsDataResponse } from './types';

export const SCRIPT_BEGIN = '__NEXT_DATA__ = ';

export const fetchFlightStatsData = async (
  flight: FlightWithData,
  customUrl?: string,
): Promise<FlightStatsDataResponse | null> => {
  const url = `https://www.flightstats.com/v2${
    customUrl ??
    `/flight-tracker/${flight.airline?.iata}/${flight.flightNumber}`
  }`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = load(response.data);
  let flightData: FlightStatsDataResponse | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      flightData = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').split('module={}')[0],
      ) as FlightStatsDataResponse;
    }
  });
  return flightData;
};