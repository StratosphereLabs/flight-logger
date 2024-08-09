import axios from 'axios';
import { load } from 'cheerio';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../../constants';
import { HEADERS } from '../constants';
import type {
  FetchFlightDataParams,
  FetchFlightsByFlightNumberParams,
} from '../types';
import type {
  FlightStatsDataResponse,
  FlightStatsFlight,
  FlightStatsFlightData,
  FlightStatsOtherDayFlight,
} from './types';

export const SCRIPT_BEGIN = '__NEXT_DATA__ = ';

const processData = (data: string): FlightStatsFlightData | null => {
  const $ = load(data);
  let flightData: FlightStatsDataResponse | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      flightData = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').split('module={}')[0],
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

const fetchData = async ({
  airline,
  customUrl,
  flightNumber,
  isoDate,
}: FetchFlightsByFlightNumberParams): Promise<FlightStatsFlightData | null> => {
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

export const fetchFlightStatsDataByFlightNumber = async ({
  airline,
  flightNumber,
  isoDate,
}: Omit<FetchFlightsByFlightNumberParams, 'customUrl'>): Promise<
  FlightStatsOtherDayFlight[] | null
> => {
  const data = await fetchData({
    airline,
    flightNumber,
    isoDate,
  });
  if (data === null) return null;
  return (
    data.otherDays.find(({ date1, year }) => {
      const date = format(new Date(`${year}-${date1}`), DATE_FORMAT_ISO);
      return date === isoDate;
    })?.flights ?? null
  );
};

export const fetchFlightStatsData = async ({
  airline,
  arrivalIata,
  departureIata,
  flightNumber,
  isoDate,
}: FetchFlightDataParams): Promise<FlightStatsFlight | null> => {
  const data = await fetchData({
    airline,
    flightNumber,
    isoDate,
  });
  if (data === null) return null;
  const { flight, otherDays } = data;
  if (Object.keys(flight).length > 0) {
    const departureDate = formatInTimeZone(
      flight.sortTime,
      flight.departureAirport.timeZoneRegionName,
      DATE_FORMAT_ISO,
    );
    if (
      flight.departureAirport.iata === departureIata &&
      flight.arrivalAirport.iata === arrivalIata &&
      departureDate === isoDate
    )
      return flight;
  }
  const flights =
    otherDays.find(({ date1, year }) => {
      const date = format(new Date(`${year}-${date1}`), DATE_FORMAT_ISO);
      return date === isoDate;
    })?.flights ?? [];
  const customUrl = flights.find(
    ({ arrivalAirport, departureAirport }) =>
      departureAirport.iata === departureIata &&
      arrivalAirport.iata === arrivalIata,
  )?.url;
  if (customUrl === undefined) return null;
  const correctedData = await fetchData({
    airline,
    flightNumber,
    isoDate,
    customUrl,
  });
  if (correctedData === null) return null;
  return correctedData.flight;
};
