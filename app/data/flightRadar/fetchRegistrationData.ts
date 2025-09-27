import axios from 'axios';
import { load } from 'cheerio';

import { HEADERS } from '../constants';
import { createNewDate } from '../utils';
import type { FlightRadarFlightData } from './types';

export type FlightRadarAircraftData = Partial<{
  aircraft: string;
  typeCode: string;
  icao24: string;
  airline: string;
  airlineIata: string;
  airlineIcao: string;
  operator: string;
  operatorIata: string;
  operatorIcao: string;
}>;

export const fetchFlightRadarRegistrationData = async (
  registration: string,
): Promise<{
  aircraftData: FlightRadarAircraftData;
  flights: FlightRadarFlightData[];
}> => {
  const url = `https://www.flightradar24.com/data/aircraft/${registration}`;
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const $ = load(response.data);
  const aircraftInfo = $('#cnt-aircraft-info');
  const aircraftData: FlightRadarAircraftData = {};
  $(aircraftInfo)
    .find('.row')
    .each((index, row) => {
      const labelText = $(row).children('label').text().trim().toUpperCase();
      const dataText = $(row).children('span').text().trim();
      if (labelText === 'AIRCRAFT') {
        aircraftData.aircraft = dataText;
      } else if (labelText === 'TYPE CODE') {
        aircraftData.typeCode = dataText;
      } else if (labelText === 'MODE S') {
        aircraftData.icao24 = dataText.toLowerCase();
      } else if (labelText === 'AIRLINE') {
        aircraftData.airline = dataText;
      } else if (labelText === 'OPERATOR') {
        aircraftData.operator = dataText;
      } else if (labelText === 'CODE') {
        const [iata, icao] = dataText.split('/').map(code => code.trim());
        if (index === 5) {
          aircraftData.airlineIata = iata;
          aircraftData.airlineIcao = icao;
        } else if (index === 6) {
          aircraftData.operatorIata = iata;
          aircraftData.operatorIcao = icao;
        }
      }
    });
  const flights: FlightRadarFlightData[] = [];
  $('tbody .data-row').each((_, row) => {
    const tableCells = $(row).find('td.hidden-xs.hidden-sm');
    const outTimeTimestamp = $(row).attr('data-timestamp');
    const inTimeTimestamp = tableCells.eq(8).attr('data-timestamp');
    if (outTimeTimestamp === undefined || inTimeTimestamp === undefined) return;
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
    const outTime = createNewDate(parseInt(outTimeTimestamp, 10));
    const offTimeTimestamp = tableCells.eq(7).attr('data-timestamp');
    const onTimeTimestamp = tableCells.eq(10).attr('data-timestamp');
    const inTime = createNewDate(parseInt(inTimeTimestamp, 10));
    const onTimeCell = tableCells.eq(10);
    const flightNumberString = tableCells.eq(4).find('a').text().trim();
    const airlineIata = flightNumberString.slice(0, 2);
    const flightNumber = parseInt(flightNumberString.slice(2), 10);
    const flightLinkText = tableCells
      .eq(11)
      .find('.btn-playback')
      .text()
      .trim();
    let flightStatus: FlightRadarFlightData['flightStatus'] | null = null;
    let diversionIata: string | null = null;
    if (onTimeCell.text().includes('Diverted to')) {
      const airport = onTimeCell.find('a').eq(0).text().trim();
      if (airport !== '') diversionIata = airport;
    }
    if (onTimeCell.text().includes('Canceled')) {
      flightStatus = 'CANCELED';
    } else if (flightLinkText === 'Live') {
      if (onTimeCell.text().includes('Estimated departure')) {
        flightStatus = 'DEPARTED_TAXIING';
      } else if (onTimeCell.text().includes('Landed')) {
        flightStatus = 'LANDED_TAXIING';
      } else {
        flightStatus = 'EN_ROUTE';
      }
    } else if (flightLinkText === 'Play') {
      if (
        onTimeCell.text().includes('Landed') ||
        onTimeCell.text().includes('Diverted to')
      ) {
        flightStatus = 'ARRIVED';
      } else if (onTimeCell.text().includes('Unknown')) {
        flightStatus = null;
      } else {
        flightStatus = 'SCHEDULED';
      }
    }
    flights.push({
      airlineIata,
      flightNumber: !isNaN(flightNumber) ? flightNumber : null,
      outTime,
      offTimeActual:
        onTimeTimestamp !== undefined &&
        onTimeTimestamp.length > 0 &&
        (flightStatus === 'SCHEDULED' || flightStatus === 'DEPARTED_TAXIING')
          ? createNewDate(parseInt(onTimeTimestamp, 10))
          : offTimeTimestamp !== undefined && offTimeTimestamp.length > 0
            ? createNewDate(parseInt(offTimeTimestamp, 10))
            : undefined,
      onTimeActual:
        onTimeTimestamp !== undefined &&
        onTimeTimestamp.length > 0 &&
        (flightStatus === 'EN_ROUTE' ||
          flightStatus === 'LANDED_TAXIING' ||
          flightStatus === 'ARRIVED')
          ? createNewDate(parseInt(onTimeTimestamp, 10))
          : undefined,
      inTime,
      departureAirportIATA,
      arrivalAirportIATA,
      aircraftTypeCode: aircraftData.typeCode ?? '',
      registration,
      flightStatus,
      diversionIata,
    });
  });
  return {
    aircraftData,
    flights,
  };
};
