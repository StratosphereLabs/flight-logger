import axios from 'axios';
import { load } from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { fetchFlightData } from '../../db';
import { HEADERS } from '../constants';
import type {
  FlightSearchDataFetchResult,
  SearchFlightsByFlightNumberParams,
} from '../types';
import { createNewDate } from '../utils';

export const searchFlightRadarFlightsByFlightNumber = async ({
  airline,
  flightNumber,
  isoDate,
}: SearchFlightsByFlightNumberParams): Promise<
  FlightSearchDataFetchResult[]
> => {
  const url = `https://www.flightradar24.com/data/flights/${
    airline.iata ?? airline.icao
  }${flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = load(response.data);
  const airportIatas = new Set<string>();
  $('tbody .data-row').each((_, row) => {
    const departureAirportText = $(row)
      .find('td.visible-xs.visible-sm .col-xs-8 a.fbold')
      .eq(0)
      .text();
    const arrivalAirportText = $(row)
      .find('td.visible-xs.visible-sm .col-xs-8 a.fbold')
      .eq(1)
      .text();
    if (departureAirportText === '' || arrivalAirportText === '') return;
    const departureAirportIATA = departureAirportText
      .split('(')[1]
      .split(')')[0];
    const arrivalAirportIATA = arrivalAirportText.split('(')[1].split(')')[0];
    airportIatas.add(departureAirportIATA);
    airportIatas.add(arrivalAirportIATA);
  });
  const flightData = await fetchFlightData({
    airportIds: [...airportIatas],
    airportSearchType: 'iata',
    airlineIds: [],
    airlineSearchType: 'id',
    aircraftTypeData: [],
    aircraftSearchType: 'id',
  });
  const data: FlightSearchDataFetchResult[] = [];
  $('tbody .data-row').each((_, row) => {
    const departureAirportText = $(row)
      .find('td.visible-xs.visible-sm .col-xs-8 a.fbold')
      .eq(0)
      .text();
    const arrivalAirportText = $(row)
      .find('td.visible-xs.visible-sm .col-xs-8 a.fbold')
      .eq(1)
      .text();
    if (departureAirportText === '' || arrivalAirportText === '') return;
    const departureAirportIATA = departureAirportText
      .split('(')[1]
      .split(')')[0];
    const arrivalAirportIATA = arrivalAirportText.split('(')[1].split(')')[0];
    const departureAirport = flightData.airports[departureAirportIATA];
    const arrivalAirport = flightData.airports[arrivalAirportIATA];
    if (departureAirport === undefined || arrivalAirport === undefined) return;
    const tableCells = $(row).find('td.hidden-xs.hidden-sm');
    const outTimeTimestamp = tableCells.eq(6).attr('data-timestamp');
    const inTimeTimestamp = tableCells.eq(8).attr('data-timestamp');
    if (
      outTimeTimestamp === undefined ||
      outTimeTimestamp === '' ||
      inTimeTimestamp === undefined ||
      inTimeTimestamp === ''
    )
      return;
    const outTime = createNewDate(parseInt(outTimeTimestamp, 10));
    const inTime = createNewDate(parseInt(inTimeTimestamp, 10));
    const departureDate = formatInTimeZone(
      outTime,
      departureAirport.timeZone,
      DATE_FORMAT_ISO,
    );
    if (departureDate !== isoDate) return;
    data.push({
      outTime,
      inTime,
      airline,
      flightNumber,
      departureAirport,
      arrivalAirport,
    });
  });
  return data.toReversed();
};
