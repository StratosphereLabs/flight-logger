import { Promise } from 'bluebird';
import { add, isAfter, isBefore, sub } from 'date-fns';
import groupBy from 'lodash.groupby';
import { scheduleJob } from 'node-schedule';

import { prisma } from '../db';
import { seedDatabase } from '../db/seeders';
import { updateFlightData } from '../utils';
import { UPDATE_CONCURRENCY } from './constants';
import type { FlightWithData } from './types';
import { getGroupedFlightsKey } from './utils';

const processFlightUpdate = async (
  flightsToUpdate: FlightWithData[],
): Promise<void> => {
  if (flightsToUpdate.length === 0) {
    console.log('No flights to update.');
    return;
  }
  const groupedFlights = groupBy(flightsToUpdate, getGroupedFlightsKey);
  await Promise.map(
    Object.entries(groupedFlights),
    async ([key, flights]) => {
      console.log(`Updating flight ${key}...`);
      await updateFlightData(flights);
    },
    {
      concurrency: UPDATE_CONCURRENCY,
    },
  );
  console.log(
    `  ${flightsToUpdate.length} flight${
      flightsToUpdate.length > 1 ? 's' : ''
    } updated successfully.`,
  );
};

const updateFlightsHourly = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        AND: [
          {
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
          },
          {
            OR: [
              {
                outTimeActual: {
                  lte: add(new Date(), { days: 3 }),
                },
              },
              {
                outTime: {
                  lte: add(new Date(), { days: 3 }),
                },
              },
            ],
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
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
          },
        },
      },
    });
    await processFlightUpdate(flightsToUpdate);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

const updateFlightsEvery15 = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                inTimeActual: {
                  gt: sub(new Date(), { hours: 12 }),
                },
              },
              {
                inTime: {
                  gt: sub(new Date(), { hours: 12 }),
                },
              },
            ],
          },
          {
            OR: [
              {
                outTimeActual: {
                  lte: add(new Date(), { days: 1 }),
                },
              },
              {
                outTime: {
                  lte: add(new Date(), { days: 1 }),
                },
              },
            ],
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
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
          },
        },
      },
    });
    await processFlightUpdate(flightsToUpdate);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

const updateFlightsEvery5 = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        OR: [
          {
            outTimeActual: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { hours: 2 }),
            },
          },
          {
            outTime: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { hours: 2 }),
            },
          },
          {
            inTimeActual: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { hours: 2 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { hours: 1 }),
              lte: add(new Date(), { hours: 2 }),
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
          },
        },
        arrivalAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
          },
        },
        diversionAirport: {
          select: {
            id: true,
            iata: true,
            timeZone: true,
          },
        },
      },
    });
    const filteredFlights = flightsToUpdate.filter(
      ({ inTime, inTimeActual }) => {
        const arrivalTime = inTimeActual ?? inTime;
        return (
          isAfter(arrivalTime, sub(new Date(), { minutes: 30 })) &&
          isBefore(arrivalTime, add(new Date(), { minutes: 90 }))
        );
      },
    );
    await processFlightUpdate(filteredFlights);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

(() => {
  scheduleJob('0 * * * *', updateFlightsHourly);
  scheduleJob('15,30,45 * * * *', updateFlightsEvery15);
  scheduleJob('5,10,20,25,35,40,50,55 * * * *', updateFlightsEvery5);
  scheduleJob('0 0 1 * *', seedDatabase);
})();
