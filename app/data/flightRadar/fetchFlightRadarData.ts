import type { Airline } from '@prisma/client';
import axios from 'axios';
import { load } from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';

import { DATE_FORMAT_ISO } from '../../constants';
import { fetchFlightData, prisma } from '../../db';
import { HEADERS } from '../constants';
import type {
  FetchFlightsByFlightNumberParams,
  FlightSearchDataFetchResult,
  FlightWithDataAirport,
} from '../types';
import { createNewDate } from '../utils';
import { NOT_AVAILABLE } from './constants';
import type { FlightRadarData, FlightRadarRoutesResponse } from './types';

export interface FetchFlightRadarDataParams {
  airline: Airline;
  arrivalAirport: FlightWithDataAirport;
  departureAirport: FlightWithDataAirport;
  flightNumber: number;
  isoDate: string;
}

export interface FetchFlightRadarAircraftDataParams {
  tailNumber: string;
}

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

export const fetchFlightRadarDataByFlightNumber = async ({
  airline,
  flightNumber,
  isoDate,
}: FetchFlightsByFlightNumberParams): Promise<
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

export const fetchFlightRadarDataByRoute = async ({
  arrivalAirportIata,
  departureAirportIata,
  isoDate,
}: {
  arrivalAirportIata: string;
  departureAirportIata: string;
  isoDate: string;
}): Promise<FlightSearchDataFetchResult[] | null> => {
  const url = `https://api.flightradar24.com/common/v1/search.json?query=default&origin=${departureAirportIata}&destination=${arrivalAirportIata}&limit=100`;
  const response = await axios.get<FlightRadarRoutesResponse>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const flightData = response.data.result.response.flight.data;
  const airlineCodes = [
    ...new Set(
      flightData.map(
        flight => `${flight.airline.code.iata}-${flight.airline.code.icao}`,
      ),
    ),
  ];
  const airportCodes = [
    ...new Set(
      flightData.flatMap(flight => [
        flight.airport.origin.code.icao,
        flight.airport.destination.code.icao,
      ]),
    ),
  ];
  const [airlineInfoData, airportInfoData] = await prisma.$transaction([
    prisma.airline.findMany({
      where: {
        OR: airlineCodes.map(codes => {
          const [iata, icao] = codes.split('-');
          return {
            iata,
            icao,
          };
        }),
      },
    }),
    prisma.airport.findMany({
      where: {
        id: {
          in: airportCodes,
        },
      },
    }),
  ]);
  const groupedAirlines = groupBy(
    airlineInfoData,
    ({ iata, icao }) => `${iata}-${icao}`,
  );
  const groupedAirports = groupBy(airportInfoData, 'id');
  return flightData.flatMap(({ airport, airline, identification, time }) => {
    const outTime = createNewDate(time.scheduled.departure);
    const inTime = createNewDate(time.scheduled.arrival);
    const departureIsoDate = formatInTimeZone(
      new Date(time.scheduled.departure),
      airport.origin.timezone.name,
      DATE_FORMAT_ISO,
    );
    const departureAirport = groupedAirports[airport.origin.code.icao][0];
    const arrivalAirport = groupedAirports[airport.destination.code.icao][0];
    const flightNumber =
      identification.number.default !== null
        ? parseInt(identification.number.default.slice(2), 10)
        : NaN;
    if (departureIsoDate === isoDate || isNaN(flightNumber)) return [];
    const airlineKey = `${airline.code.iata}-${airline.code.icao}`;
    const airlineData = groupedAirlines[airlineKey][0];
    return {
      outTime,
      inTime,
      airline: airlineData,
      flightNumber,
      departureAirport,
      arrivalAirport,
    };
  });
};

export const fetchAircraftRegistrationData = async (
  registration: string,
): Promise<{
  aircraftData: FlightRadarAircraftData;
  flights: FlightRadarData[];
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
  const flights: FlightRadarData[] = [];
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
    let flightStatus: FlightRadarData['flightStatus'] | null = null;
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

export const fetchFlightRadarData = async ({
  airline,
  arrivalAirport,
  departureAirport,
  flightNumber,
  isoDate,
}: FetchFlightRadarDataParams): Promise<FlightRadarData | null> => {
  const url = `https://www.flightradar24.com/data/flights/${
    airline.iata ?? airline.icao
  }${flightNumber}`;
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const $ = load(response.data);
  const data: FlightRadarData[] = [];
  $('tbody .data-row').each((_, row) => {
    const tableCells = $(row).find('td.hidden-xs.hidden-sm');
    const outTimeTimestamp = $(row).attr('data-timestamp');
    const inTimeTimestamp = tableCells.eq(9).attr('data-timestamp');
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
    let flightStatus: FlightRadarData['flightStatus'] | null = null;
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
