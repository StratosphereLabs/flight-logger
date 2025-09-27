import axios from 'axios';
import { load } from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../../constants';
import { HEADERS } from '../constants';
import type { FetchFlightDataParams } from '../types';
import { createNewDate } from '../utils';
import { NOT_AVAILABLE } from './constants';
import type { FlightRadarFlightData } from './types';

export const fetchFlightRadarFlightData = async ({
  airline,
  arrivalAirport,
  departureAirport,
  flightNumber,
  isoDate,
}: FetchFlightDataParams): Promise<FlightRadarFlightData | null> => {
  const url = `https://www.flightradar24.com/data/flights/${
    airline.iata ?? airline.icao
  }${flightNumber}`;
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const $ = load(response.data);
  const data: FlightRadarFlightData[] = [];
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
    if (
      departureAirportIATA !== departureAirport.iata ||
      arrivalAirportIATA !== arrivalAirport.iata
    )
      return;
    const registrationText = $(row)
      .find('td.visible-xs.visible-sm .col-xs-3 .row')
      .eq(0)
      .text()
      .trim();
    const registration =
      registrationText === NOT_AVAILABLE
        ? null
        : registrationText.length > 1
          ? registrationText
          : undefined;
    const outTime = createNewDate(parseInt(outTimeTimestamp, 10));
    const departureDate = formatInTimeZone(
      outTime,
      departureAirport.timeZone,
      DATE_FORMAT_ISO,
    );
    if (departureDate !== isoDate) return;
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
    const inTime = createNewDate(parseInt(inTimeTimestamp, 10));
    const onTimeCell = tableCells.eq(10);
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
    data.push({
      airlineIata: airline.iata,
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
      aircraftTypeCode,
      registration,
      flightStatus,
      diversionIata,
    });
  });
  return (
    data.find(({ flightStatus }) => flightStatus === 'ARRIVED') ??
    data[0] ??
    null
  );
};
