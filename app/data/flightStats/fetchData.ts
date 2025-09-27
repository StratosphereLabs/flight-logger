import axios from 'axios';
import { load } from 'cheerio';

import { HEADERS } from '../constants';
import type { SearchFlightsByFlightNumberParams } from '../types';
import type { FlightStatsDataResponse, FlightStatsFlightData } from './types';

const SCRIPT_BEGIN = '__NEXT_DATA__ = ';

const processData = (data: string): FlightStatsFlightData | null => {
  const $ = load(data);
  let flightData: FlightStatsDataResponse | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      flightData = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').split(';__NEXT_LOADED_PAGES__=')[0],
      ) as FlightStatsDataResponse;
    }
  });
  if (flightData === null) return null;
  const { flight, otherDays } = (flightData as FlightStatsDataResponse).props
    .initialState.flightTracker;
  if (flight === undefined || otherDays === undefined || otherDays === '')
    return null;
  return {
    flight,
    otherDays,
  };
};

export const fetchData = async ({
  airline,
  customUrl,
  flightNumber,
  isoDate,
}: SearchFlightsByFlightNumberParams): Promise<FlightStatsFlightData | null> => {
  if (customUrl !== undefined) {
    const url = `https://www.flightstats.com/v2${customUrl}`;
    const response = await axios.get<string>(url, {
      headers: HEADERS,
      withCredentials: true,
    });
    const data = processData(response.data);
    return data;
  }
  const [year, month, day] = isoDate.split('-');
  const dateParams = new URLSearchParams({ year, month, day }).toString();
  if (airline.flightStatsCode !== null) {
    const url = `https://www.flightstats.com/v2/flight-tracker/${airline.flightStatsCode}/${flightNumber}?${dateParams}`;
    const response = await axios.get<string>(url, {
      headers: HEADERS,
      withCredentials: true,
    });
    const data = processData(response.data);
    if (data !== null) return data;
  }
  if (airline.iata !== null) {
    const url = `https://www.flightstats.com/v2/flight-tracker/${airline.iata}/${flightNumber}?${dateParams}`;
    const response = await axios.get<string>(url, {
      headers: HEADERS,
      withCredentials: true,
    });
    const data = processData(response.data);
    if (data !== null) return data;
  }
  const url = `https://www.flightstats.com/v2/flight-tracker/${airline.icao}/${flightNumber}?${dateParams}`;
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  return processData(response.data);
};
