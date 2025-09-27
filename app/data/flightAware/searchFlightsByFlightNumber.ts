import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { fetchFlightData } from '../../db';
import { HEADERS } from '../constants';
import type {
  FlightSearchDataFetchResult,
  SearchFlightsByFlightNumberParams,
} from '../types';
import { createNewDate } from '../utils';
import { processData } from './processData';

export const searchFlightAwareFlightsByFlightNumber = async ({
  airline,
  flightNumber,
  isoDate,
}: SearchFlightsByFlightNumberParams): Promise<
  FlightSearchDataFetchResult[] | null
> => {
  const url = `https://www.flightaware.com/live/flight/${airline.icao}${flightNumber}`;
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
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
