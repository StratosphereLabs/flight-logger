import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { HEADERS } from '../constants';
import type { FetchFlightDataParams } from '../types';
import { createNewDate } from '../utils';
import { processData } from './processData';
import type { FlightAwareDataResult } from './types';

export interface FetchFlightAwareFlightDataParams
  extends FetchFlightDataParams {
  fetchTrackingData?: boolean;
}

export const fetchFlightAwareFlightData = async ({
  airline,
  flightNumber,
  isoDate,
  departureAirport,
  arrivalAirport,
  fetchTrackingData,
}: FetchFlightAwareFlightDataParams): Promise<FlightAwareDataResult | null> => {
  const url = `https://www.flightaware.com/live/flight/${airline.icao}${flightNumber}`;
  console.log(`  Fetching flight data from ${url}`);
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const flightAwareData = processData(response.data);
  if (flightAwareData === null) return null;
  const flightData =
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
          origin.iata === departureAirport.iata &&
          destination.iata === arrivalAirport.iata &&
          gateDepartureTimes.scheduled !== null &&
          gateDepartureTimes.estimated !== null &&
          gateArrivalTimes.scheduled !== null &&
          gateArrivalTimes.estimated !== null
        );
      },
    ) ?? null;
  if (flightData === null) return null;
  if (fetchTrackingData === true && flightData.permaLink !== null) {
    const flightUrl = `https://www.flightaware.com${flightData.permaLink}`;
    console.log(`  Fetching flight data from ${flightUrl}`);
    const flightResponse = await axios.get<string>(flightUrl, {
      headers: HEADERS,
    });
    const tracklogData = processData(flightResponse.data);
    if (tracklogData === null) return flightData;
    return {
      ...flightData,
      track: Object.values(tracklogData.flights)[0]?.track ?? undefined,
      waypoints: Object.values(tracklogData.flights)[0]?.waypoints ?? undefined,
    };
  }
  return flightData;
};
