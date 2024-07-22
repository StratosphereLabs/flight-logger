import axios from 'axios';
import { load } from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../../constants';
import { fetchFlightData } from '../../db';
import { HEADERS } from '../constants';
import { createNewDate } from '../utils';
import type {
  FetchFlightDataParams,
  FetchFlightsByFlightNumberParams,
  FlightSearchDataFetchResult,
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
  FlightSearchDataFetchResult[] | null
> => {
  const url = `https://www.flightaware.com/live/flight/${airline.icao}${flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const data = processData(response.data);
  if (data === null) return null;
  const flights = Object.values(data.flights)[0]?.activityLog?.flights ?? [];
  const airportIcaos = new Set<string>(
    flights.flatMap(({ origin, destination }) => [
      origin.icao,
      destination.icao,
    ]),
  );
  const flightData = await fetchFlightData({
    airportIds: [...airportIcaos],
    airportSearchType: 'id',
    airlineIds: [],
    airlineSearchType: 'id',
    aircraftTypeData: [],
    aircraftSearchType: 'id',
  });
  return flights.reduce(
    (
      acc: FlightSearchDataFetchResult[],
      { origin, gateDepartureTimes, gateArrivalTimes, destination },
    ) => {
      const outTime = createNewDate(gateDepartureTimes.scheduled);
      const inTime = createNewDate(gateArrivalTimes.scheduled);
      const formattedDate = formatInTimeZone(
        outTime,
        origin.TZ.replace(/:/g, ''),
        DATE_FORMAT_ISO,
      );
      const departureAirport = flightData.airports[origin.icao];
      const arrivalAirport = flightData.airports[destination.icao];
      if (
        formattedDate === isoDate &&
        departureAirport !== undefined &&
        arrivalAirport !== undefined
      ) {
        return [
          ...acc,
          {
            outTime,
            inTime,
            airline,
            flightNumber,
            departureAirport,
            arrivalAirport,
          },
        ];
      }
      return acc;
    },
    [],
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
  const flightAwareData = processData(response.data);
  if (flightAwareData === null) return null;
  return (
    Object.values(flightAwareData.flights)[0]?.activityLog?.flights?.find(
      ({ origin, destination, gateDepartureTimes, gateArrivalTimes }) => {
        const date = createNewDate(gateDepartureTimes.scheduled);
        const formattedDate = formatInTimeZone(
          date,
          origin.TZ.replace(/:/g, ''),
          DATE_FORMAT_ISO,
        );
        return (
          formattedDate === isoDate &&
          origin.iata === departureIata &&
          destination.iata === arrivalIata &&
          gateDepartureTimes.scheduled !== null &&
          gateDepartureTimes.estimated !== null &&
          gateArrivalTimes.scheduled !== null &&
          gateArrivalTimes.estimated !== null
        );
      },
    ) ?? null
  );
};
