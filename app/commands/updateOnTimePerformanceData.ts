import { isAfter, isBefore, sub } from 'date-fns';

import { fetchOnTimePerformanceData } from '../data/flightStats';
import { prisma } from '../db';
import type { FlightWithData } from './types';

export const updateOnTimePerformanceData = async (
  flights: FlightWithData[],
): Promise<void> => {
  if (
    flights[0].airline?.iata === null ||
    flights[0].airline?.iata === undefined ||
    flights[0].flightNumber === null
  ) {
    console.error('Airline and flight number are required.');
    return;
  }
  if (process.env.FLIGHT_TIMES_DATASOURCE === 'flightstats') {
    const flightDataString = `${flights[0].airline.iata}${flights[0].flightNumber} ${flights[0].departureAirport.iata}-${flights[0].arrivalAirport.iata}`;
    console.log(`Updating On-Time Performance data for ${flightDataString}...`);
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
      console.log(
        `  On-Time Performance data already found for ${flightDataString}.`,
      );
      return;
    }
    const onTimePerformanceData = await fetchOnTimePerformanceData({
      airlineIata:
        flights[0].airline.flightStatsCode ?? flights[0].airline.iata,
      flightNumber: flights[0].flightNumber,
      departureIata: flights[0].departureAirport.iata,
    });
    if (
      onTimePerformanceData === null ||
      flights[0].arrivalAirportId !== onTimePerformanceData.arrivalAirport.icao
    ) {
      console.error(
        `  On-Time Performance data not found for ${flightDataString}. Please try again later.`,
      );
      return;
    }
    console.log(`  On-Time Performance data found for ${flightDataString}.`);
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
  }
};
