import { isAfter, isBefore, sub } from 'date-fns';

import { prisma } from '../../db';
import {
  type OnTimePerformanceData,
  fetchOnTimePerformanceData,
} from '../flightStats';
import type { FlightWithData } from '../types';
import { getGroupedFlightsKey } from '../utils';

export const updateOnTimePerformanceData = async (
  flights: FlightWithData[],
): Promise<void> => {
  if (
    flights[0].airline?.iata === null ||
    flights[0].airline?.iata === undefined ||
    flights[0].flightNumber === null
  ) {
    console.log('  Airline and flight number are required.');
    return;
  }
  const flightDataString = getGroupedFlightsKey(flights[0]);
  const twoMonthsAgo = sub(new Date(), { months: 2 });
  const rating = await prisma.onTimePerformanceRating.findFirst({
    where: {
      airlineId: flights[0].airline.id,
      flightNumber: flights[0].flightNumber,
      departureAirportId: flights[0].departureAirportId,
      arrivalAirportId: flights[0].arrivalAirportId,
    },
    orderBy: {
      validTo: 'desc',
    },
  });
  if (
    rating !== null &&
    isBefore(rating.validFrom, twoMonthsAgo) &&
    isAfter(rating.validTo, twoMonthsAgo)
  ) {
    return;
  }
  console.log(`Fetching on-time performance data for ${flightDataString}...`);
  let onTimePerformanceData: OnTimePerformanceData | null = null;
  try {
    onTimePerformanceData = await fetchOnTimePerformanceData({
      airlineIata:
        flights[0].airline.flightStatsCode ?? flights[0].airline.iata,
      flightNumber: flights[0].flightNumber,
      departureIata: flights[0].departureAirport.iata,
    });
  } catch (err) {
    console.error(err);
  }
  if (
    onTimePerformanceData === null ||
    flights[0].arrivalAirportId !== onTimePerformanceData.arrivalAirport.icao
  ) {
    console.log(
      `  On-time performance data not found for ${flightDataString}.`,
    );
    return;
  }
  await prisma.onTimePerformanceRating.create({
    data: {
      airline: {
        connect: {
          id: flights[0].airline.id,
        },
      },
      flightNumber: flights[0].flightNumber,
      departureAirport: {
        connect: {
          id: onTimePerformanceData.departureAirport.icao,
        },
      },
      arrivalAirport: {
        connect: {
          id: onTimePerformanceData.arrivalAirport.icao,
        },
      },
      validFrom: onTimePerformanceData.validFrom,
      validTo: onTimePerformanceData.validTo,
      onTime: onTimePerformanceData.chart.onTime,
      late: onTimePerformanceData.chart.late,
      veryLate: onTimePerformanceData.chart.veryLate,
      excessive: onTimePerformanceData.chart.excessive,
      cancelled: onTimePerformanceData.chart.cancelled,
      diverted: onTimePerformanceData.chart.diverted,
      totalObservations: onTimePerformanceData.statistics.totalObservations,
      delayObservations: onTimePerformanceData.statistics.delayObservations,
      mean: onTimePerformanceData.statistics.mean,
      standardDeviation: onTimePerformanceData.statistics.standardDeviation,
      min: onTimePerformanceData.statistics.min,
      max: onTimePerformanceData.statistics.max,
      onTimePercent: onTimePerformanceData.details.otp.ontimePercent,
    },
  });
};
