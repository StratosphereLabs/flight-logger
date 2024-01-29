import axios from 'axios';
import { load } from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';
import { type FlightWithDataAirport } from '../../commands/updateData';
import { DATE_FORMAT_ISO } from '../../constants';
import { HEADERS } from '../constants';
import type { RegistrationData } from './types';
import { createNewDate } from './utils';

export interface FetchFlightRegistrationDataParams {
  airlineIata: string;
  arrivalAirport: FlightWithDataAirport;
  departureAirport: FlightWithDataAirport;
  flightNumber: number;
  isoDate: string;
}

export const fetchFlightRegistrationData = async ({
  airlineIata,
  arrivalAirport,
  departureAirport,
  flightNumber,
  isoDate,
}: FetchFlightRegistrationDataParams): Promise<RegistrationData | null> => {
  const url = `https://www.flightradar24.com/data/flights/${airlineIata}${flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = load(response.data);
  let registrationData: RegistrationData | null = null;
  $('tbody .data-row').each((_, row) => {
    const timestamp = $(row).attr('data-timestamp');
    if (timestamp === undefined) return;
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
    if (
      departureAirportIATA !== departureAirport.iata ||
      arrivalAirportIATA !== arrivalAirport.iata
    )
      return;
    const registration = $(row)
      .find('td.visible-xs.visible-sm .col-xs-3 .row')
      .eq(0)
      .text()
      .trim();
    if (registration.length === 0) return;
    const departureTime = createNewDate(parseInt(timestamp, 10));
    const departureDate = formatInTimeZone(
      departureTime,
      departureAirport.timeZone,
      DATE_FORMAT_ISO,
    );
    if (departureDate !== isoDate) return;
    const tableCells = $(row).find('td.hidden-xs.hidden-sm');
    const aircraftTypeCode = tableCells
      .eq(4)
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();
    const offTimeTimestamp = tableCells.eq(7).attr('data-timestamp');
    const onTimeTimestamp = tableCells.eq(10).attr('data-timestamp');
    const onTimeText = tableCells.eq(10).text();
    registrationData = {
      departureTime,
      offTimeActual:
        offTimeTimestamp !== undefined && offTimeTimestamp.length > 0
          ? createNewDate(parseInt(offTimeTimestamp, 10))
          : undefined,
      onTimeActual:
        onTimeTimestamp !== undefined &&
        onTimeTimestamp.length > 0 &&
        (onTimeText.includes('Landed') ||
          (onTimeText.includes('Estimated') &&
            !onTimeText.includes('departure')))
          ? createNewDate(parseInt(onTimeTimestamp, 10))
          : undefined,
      departureAirportIATA,
      arrivalAirportIATA,
      aircraftTypeCode,
      registration,
    };
  });
  return registrationData;
};
