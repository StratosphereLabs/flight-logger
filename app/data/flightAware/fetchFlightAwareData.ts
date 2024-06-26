import axios from 'axios';
import { load } from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../../constants';
import { HEADERS } from '../constants';
import { createNewDate } from '../utils';
import type {
  FetchFlightDataParams,
  FetchFlightsByFlightNumberParams,
} from '../types';
import type { FlightAwareDataResponse, FlightAwareFlightData } from './types';

export const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

const processData = (data: string): FlightAwareDataResponse | null => {
  const $ = load(data);
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

export const fetchFlightAwareDataByFlightNumber = async ({
  airline,
  flightNumber,
  isoDate,
}: FetchFlightsByFlightNumberParams): Promise<
  FlightAwareFlightData[] | null
> => {
  const url = `https://www.flightaware.com/live/flight/${airline.icao}${flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const data = processData(response.data);
  if (data === null) return null;
  return (
    Object.values(data.flights)[0]?.activityLog?.flights?.filter(
      ({ origin, gateDepartureTimes }) => {
        const date = createNewDate(gateDepartureTimes.scheduled);
        const formattedDate = formatInTimeZone(
          date,
          origin.TZ.replace(/:/g, ''),
          DATE_FORMAT_ISO,
        );
        return formattedDate === isoDate;
      },
    ) ?? []
  );
};

export const fetchFlightAwareData = async ({
  airline,
  flightNumber,
  isoDate,
  departureIata,
  arrivalIata,
}: FetchFlightDataParams): Promise<FlightAwareFlightData | null> => {
  const url = `https://www.flightaware.com/live/flight/${airline.icao}${flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const data = processData(response.data);
  if (data === null) return null;
  return (
    Object.values(data.flights)[0]?.activityLog?.flights?.find(
      ({ origin, destination, gateDepartureTimes }) => {
        const date = createNewDate(gateDepartureTimes.scheduled);
        const formattedDate = formatInTimeZone(
          date,
          origin.TZ.replace(/:/g, ''),
          DATE_FORMAT_ISO,
        );
        return (
          formattedDate === isoDate &&
          origin.iata === departureIata &&
          destination.iata === arrivalIata
        );
      },
    ) ?? null
  );
};
