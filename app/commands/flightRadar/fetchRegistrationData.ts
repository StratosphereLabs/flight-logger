import axios from 'axios';
import { load } from 'cheerio';
import { HEADERS } from '../constants';
import { type FlightWithData } from '../updateFlights';
import { createNewDate } from '../utils';
import type { RegistrationData } from './types';

export const fetchRegistrationData = async (
  flight: FlightWithData,
): Promise<RegistrationData[]> => {
  const url = `https://www.flightradar24.com/data/flights/${flight.airline?.iata}${flight.flightNumber}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = load(response.data);
  const registrationData: RegistrationData[] = [];
  $('tbody .data-row').each((_, row) => {
    const timestamp = $(row).attr('data-timestamp');
    if (timestamp === undefined) return;
    const departureTime = createNewDate(parseInt(timestamp, 10));
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
    const registration = $(row)
      .find('td.visible-xs.visible-sm .col-xs-3 .row')
      .eq(0)
      .text()
      .trim();
    if (registration.length > 1) {
      registrationData.push({
        departureTime,
        departureAirportIATA,
        arrivalAirportIATA,
        registration,
      });
    }
  });
  return registrationData;
};
