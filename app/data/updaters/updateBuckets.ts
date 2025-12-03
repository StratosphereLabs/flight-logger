import { Promise } from 'bluebird';
import { add, isAfter, isBefore, max, min, sub } from 'date-fns';
import groupBy from 'lodash.groupby';

import { FLIGHT_DATA_PROMISE_CONCURRENCY } from '../../constants';
import { prisma } from '../../db';
import type { FlightWithData } from '../types';
import { getGroupedFlightsKey } from '../utils';
import { updateFlightData } from './updateFlightData';
import { updateFlightTrackData } from './updateFlightTrackData';
import { updateFlightWeatherReports } from './updateFlightWeatherReports';
import { updateOnTimePerformanceData } from './updateOnTimePerformanceData';
import { updateTrackAircraftData } from './updateTrackAircraftData';

const processFlightUpdate = async (
  flightsToUpdate: FlightWithData[],
  updateFn: (flights: FlightWithData[]) => Promise<void>,
): Promise<void> => {
  if (flightsToUpdate.length === 0) {
    console.log('No flights to update.');
    return;
  }
  const groupedFlights = groupBy(flightsToUpdate, getGroupedFlightsKey);
  let firstIteration = true;
  await Promise.map(
    Object.entries(groupedFlights),
    async ([key, flights]) => {
      if (firstIteration) {
        console.log('');
        firstIteration = false;
      }
      console.log(`============[AUTOMATED FLIGHT UPDATE - ${key}]============`);
      flights.forEach(flight => {
        console.log(`${process.env.VITE_APP_URL}/flight/${flight.id}`);
      });
      await updateFn(flights);
      console.log(
        `====================================================${key
          .split('')
          .map(_ => '=')
          .join('')}`,
      );
      console.log('');
    },
    { concurrency: FLIGHT_DATA_PROMISE_CONCURRENCY },
  );
};

/**
 * Bucket #2 - Daily
 * 7 days before scheduled departure - 3 days after arrival
 */
export const updateFlightsDaily = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        outTime: {
          lte: add(new Date(), { days: 3 }),
        },
        OR: [
          {
            inTimeActual: {
              gt: sub(new Date(), { days: 1 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { days: 1 }),
            },
          },
        ],
        airline: {
          isNot: null,
        },
        flightNumber: {
          not: null,
        },
      },
      include: {
        airline: true,
        departureAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
      },
    });
    await processFlightUpdate(flightsToUpdate, async flights => {
      const updatedFlights = await updateFlightData(flights);
      await updateTrackAircraftData(updatedFlights);
      await updateOnTimePerformanceData(updatedFlights);
      await updateFlightWeatherReports(updatedFlights);
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Bucket #3 - Hourly
 * 3 days before scheduled departure - 1 day after arrival
 */
export const updateFlightsHourly = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        outTime: {
          lte: add(new Date(), { days: 3 }),
        },
        OR: [
          {
            inTimeActual: {
              gt: sub(new Date(), { days: 1 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { days: 1 }),
            },
          },
        ],
        airline: {
          isNot: null,
        },
        flightNumber: {
          not: null,
        },
      },
      include: {
        airline: true,
        departureAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
      },
    });
    await processFlightUpdate(flightsToUpdate, async flights => {
      const updatedFlights = await updateFlightData(flights);
      await updateTrackAircraftData(updatedFlights);
      await updateFlightWeatherReports(updatedFlights);
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Bucket #4 - Every 15 minutes
 * 24 hours before scheduled departure - 3 hours after arrival
 */
export const updateFlightsEvery15 = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        outTime: {
          lte: add(new Date(), { hours: 24 }),
        },
        OR: [
          {
            inTimeActual: {
              gt: sub(new Date(), { hours: 3 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { hours: 3 }),
            },
          },
        ],
        airline: {
          isNot: null,
        },
        flightNumber: {
          not: null,
        },
      },
      include: {
        airline: true,
        departureAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
      },
    });
    await processFlightUpdate(flightsToUpdate, async flights => {
      const updatedFlights = await updateFlightData(flights);
      const hasAirframeChanged =
        updatedFlights[0].airframeId !== null &&
        updatedFlights[0].airframeId !== flights[0].airframeId;
      if (hasAirframeChanged) {
        await updateTrackAircraftData(updatedFlights);
      }
      await updateFlightWeatherReports(updatedFlights);
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Bucket #5 - Every 5 minutes
 * 2 hours before departure - 1 hour after arrival
 */
export const updateFlightsEvery5 = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        outTime: {
          lte: add(new Date(), { hours: 2 }),
        },
        OR: [
          {
            inTimeActual: {
              gt: sub(new Date(), { hours: 1 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { hours: 1 }),
            },
          },
        ],
        airline: {
          isNot: null,
        },
        flightNumber: {
          not: null,
        },
      },
      include: {
        airline: true,
        departureAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
      },
    });
    const filteredFlights = flightsToUpdate.filter(
      ({ outTime, outTimeActual, inTime, inTimeActual }) => {
        const departureTime = outTimeActual ?? outTime;
        const arrivalTime = inTimeActual ?? inTime;
        return (
          (isAfter(new Date(), sub(departureTime, { hours: 2 })) &&
            isBefore(new Date(), add(departureTime, { hours: 1 }))) ||
          (isAfter(new Date(), sub(arrivalTime, { hours: 2 })) &&
            isBefore(new Date(), add(arrivalTime, { hours: 1 })))
        );
      },
    );
    await processFlightUpdate(filteredFlights, async flights => {
      const updatedFlights = await updateFlightData(flights);
      const hasAirframeChanged =
        updatedFlights[0].airframeId !== null &&
        updatedFlights[0].airframeId !== flights[0].airframeId;
      if (hasAirframeChanged) {
        await updateTrackAircraftData(updatedFlights);
      }
      await updateFlightWeatherReports(updatedFlights);
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Bucket #6 - Every 1 minute
 * 5 minutes before departure - 1 hour after departure
 * 1 hour before arrival - 5 minutes after arrival
 */
export const updateFlightsEveryMinute = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        OR: [
          {
            outTimeActual: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { minutes: 5 }),
            },
          },
          {
            outTime: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { minutes: 5 }),
            },
          },
          {
            offTimeActual: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { minutes: 5 }),
            },
          },
          {
            offTime: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { minutes: 5 }),
            },
          },
          {
            onTimeActual: {
              gt: sub(new Date(), { minutes: 5 }),
              lte: add(new Date(), { hours: 1 }),
            },
          },
          {
            onTime: {
              gt: sub(new Date(), { minutes: 5 }),
              lte: add(new Date(), { hours: 1 }),
            },
          },
          {
            inTimeActual: {
              gt: sub(new Date(), { minutes: 5 }),
              lte: add(new Date(), { hours: 1 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { minutes: 5 }),
              lte: add(new Date(), { hours: 1 }),
            },
          },
        ],
        airline: {
          isNot: null,
        },
        flightNumber: {
          not: null,
        },
      },
      include: {
        airline: true,
        departureAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
      },
    });
    const filteredFlights = flightsToUpdate.filter(
      ({
        outTime,
        outTimeActual,
        offTime,
        offTimeActual,
        onTime,
        onTimeActual,
        inTime,
        inTimeActual,
      }) => {
        const departureTime = min([
          offTimeActual ?? offTime ?? outTime,
          outTimeActual ?? outTime,
        ]);
        const arrivalTime = max([
          onTimeActual ?? onTime ?? inTime,
          inTimeActual ?? inTime,
        ]);
        return (
          (isAfter(new Date(), sub(departureTime, { minutes: 5 })) &&
            isBefore(new Date(), add(departureTime, { hours: 1 }))) ||
          (isAfter(new Date(), sub(arrivalTime, { hours: 1 })) &&
            isBefore(new Date(), add(arrivalTime, { minutes: 5 })))
        );
      },
    );
    await processFlightUpdate(filteredFlights, updateFlightTrackData);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Bucket #7 - Every 15 seconds
 * 1 minute before takeoff - 30 min after takeoff
 * 30 min before landing - 1 minute after landing
 */
export const updateFlightsEvery15Seconds = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        OR: [
          {
            outTimeActual: {
              gt: sub(new Date(), { minutes: 30 }),
              lte: add(new Date(), { minutes: 1 }),
            },
          },
          {
            outTime: {
              gt: sub(new Date(), { minutes: 30 }),
              lte: add(new Date(), { minutes: 1 }),
            },
          },
          {
            offTimeActual: {
              gt: sub(new Date(), { minutes: 30 }),
              lte: add(new Date(), { minutes: 1 }),
            },
          },
          {
            offTime: {
              gt: sub(new Date(), { minutes: 30 }),
              lte: add(new Date(), { minutes: 1 }),
            },
          },
          {
            onTimeActual: {
              gt: sub(new Date(), { minutes: 1 }),
              lte: add(new Date(), { minutes: 30 }),
            },
          },
          {
            onTime: {
              gt: sub(new Date(), { minutes: 1 }),
              lte: add(new Date(), { minutes: 30 }),
            },
          },
          {
            inTimeActual: {
              gt: sub(new Date(), { minutes: 1 }),
              lte: add(new Date(), { minutes: 30 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { minutes: 1 }),
              lte: add(new Date(), { minutes: 30 }),
            },
          },
        ],
        airline: {
          isNot: null,
        },
        flightNumber: {
          not: null,
        },
      },
      include: {
        airline: true,
        departureAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
            lat: true,
            lon: true,
            elevation: true,
          },
        },
      },
    });
    const filteredFlights = flightsToUpdate.filter(
      ({
        offTime,
        offTimeActual,
        outTime,
        outTimeActual,
        onTime,
        onTimeActual,
        inTime,
        inTimeActual,
      }) => {
        const departureTime = min([
          offTimeActual ?? offTime ?? outTime,
          outTimeActual ?? outTime,
        ]);
        const arrivalTime = max([
          onTimeActual ?? onTime ?? inTime,
          inTimeActual ?? inTime,
        ]);
        return (
          (isAfter(new Date(), sub(departureTime, { minutes: 1 })) &&
            isBefore(new Date(), add(departureTime, { minutes: 30 }))) ||
          (isAfter(new Date(), sub(arrivalTime, { minutes: 30 })) &&
            isBefore(new Date(), add(arrivalTime, { minutes: 1 })))
        );
      },
    );
    await processFlightUpdate(filteredFlights, updateFlightTrackData);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};
