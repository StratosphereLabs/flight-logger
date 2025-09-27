import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import groupBy from 'lodash.groupby';

import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { HEADERS } from '../constants';
import type { FlightSearchDataFetchResult } from '../types';
import { createNewDate } from '../utils';
import type { FlightRadarRoutesResponse } from './types';

export const searchFlightRadarFlightsByRoute = async ({
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
