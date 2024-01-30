import axios from 'axios';
import { load } from 'cheerio';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../../constants';
import { HEADERS } from '../constants';
import type {
  FlightStatsDataResponse,
  FlightStatsFlight,
  FlightStatsOtherDayFlight,
} from './types';

export const SCRIPT_BEGIN = '__NEXT_DATA__ = ';

interface FetchDataParams {
  airlineIata: string;
  customUrl?: string;
  flightNumber: number;
  isoDate: string;
}

export interface FetchFlightStatsDataParams
  extends Omit<FetchDataParams, 'customUrl'> {
  arrivalIata: string;
  departureIata: string;
}

const fetchData = async ({
  airlineIata,
  customUrl,
  flightNumber,
  isoDate,
}: FetchDataParams): Promise<FlightStatsDataResponse | null> => {
  const [year, month, day] = isoDate.split('-');
  const dateParams = new URLSearchParams({ year, month, day }).toString();
  const url = `https://www.flightstats.com/v2${
    customUrl ?? `/flight-tracker/${airlineIata}/${flightNumber}?${dateParams}`
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

export const fetchFlightStatsDataByFlightNumber = async ({
  airlineIata,
  flightNumber,
  isoDate,
}: Omit<FetchDataParams, 'customUrl'>): Promise<
  FlightStatsOtherDayFlight[] | null
> => {
  const data = await fetchData({
    airlineIata,
    flightNumber,
    isoDate,
  });
  if (data === null) return null;
  const { otherDays } = data.props.initialState.flightTracker;
  if (otherDays === '') return null;
  return (
    otherDays.find(({ date1, year }) => {
      const date = format(new Date(`${year}-${date1}`), DATE_FORMAT_ISO);
      return date === isoDate;
    })?.flights ?? null
  );
};

export const fetchFlightStatsData = async ({
  airlineIata,
  arrivalIata,
  departureIata,
  flightNumber,
  isoDate,
}: FetchFlightStatsDataParams): Promise<FlightStatsFlight | null> => {
  const data = await fetchData({
    airlineIata,
    flightNumber,
    isoDate,
  });
  if (data === null) return null;
  const { flight, otherDays } = data.props.initialState.flightTracker;
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
  if (otherDays === '') return null;
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
    airlineIata,
    flightNumber,
    isoDate,
    customUrl,
  });
  if (correctedData === null) return null;
  return correctedData.props.initialState.flightTracker.flight;
};
