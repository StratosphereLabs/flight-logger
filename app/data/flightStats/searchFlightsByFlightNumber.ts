import { format } from 'date-fns';
import groupBy from 'lodash.groupby';

import { DATE_FORMAT_ISO } from '../../constants';
import { prisma } from '../../db';
import { getFlightTimes } from '../../utils';
import type {
  FlightSearchDataFetchResult,
  SearchFlightsByFlightNumberParams,
} from '../types';
import { fetchData } from './fetchData';

export const searchFlightStatsFlightsByFlightNumber = async ({
  airline,
  flightNumber,
  isoDate,
}: Omit<SearchFlightsByFlightNumberParams, 'customUrl'>): Promise<
  FlightSearchDataFetchResult[]
> => {
  const flightStatsData = await fetchData({
    airline,
    flightNumber,
    isoDate,
  });
  if (flightStatsData === null) return [];
  const otherFlights = flightStatsData.otherDays.find(({ date1, year }) => {
    const date = format(new Date(`${year}-${date1}`), DATE_FORMAT_ISO);
    return date === isoDate;
  })?.flights;
  if (otherFlights === undefined) return [];
  const airportIds = [
    ...new Set(
      otherFlights.flatMap(({ departureAirport, arrivalAirport }) => [
        departureAirport.iata,
        arrivalAirport.iata,
      ]),
    ),
  ];
  const airports = await prisma.airport.findMany({
    where: {
      iata: {
        in: airportIds,
      },
    },
  });
  const groupedAirports = groupBy(airports, 'iata');
  return otherFlights.flatMap(flight => {
    const departureAirport = groupedAirports[flight.departureAirport.iata]?.[0];
    const arrivalAirport = groupedAirports[flight.arrivalAirport.iata]?.[0];
    if (departureAirport === undefined || arrivalAirport === undefined)
      return [];
    const { outTime, inTime } = getFlightTimes({
      departureAirport,
      arrivalAirport,
      outDateISO: isoDate,
      outTimeValue: flight.departureTime24,
      inTimeValue: flight.arrivalTime24,
    });
    return {
      outTime,
      inTime,
      airline,
      flightNumber,
      departureAirport,
      arrivalAirport,
    };
  });
};
