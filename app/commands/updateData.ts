import { Promise } from 'bluebird';
import { add, isAfter, isBefore, sub } from 'date-fns';
import groupBy from 'lodash.groupby';
import { scheduleJob } from 'node-schedule';
import { prisma } from '../db';
import {
  seedAircraftTypes,
  seedAirframes,
  seedAirlines,
  seedAirports,
  seedManufacturers,
} from '../db/seeders';
import { UPDATE_CONCURRENCY } from './constants';
import type { FlightWithData } from './types';
import { updateFlightTimesData } from './updateFlightTimesData';
import { updateFlightRegistrationData } from './updateFlightRegistrationData';
import { getGroupedFlightsKey } from './utils';

const processFlightUpdate = async (
  flightsToUpdate: FlightWithData[],
): Promise<void> => {
  if (flightsToUpdate.length === 0) {
    console.log('No flights to update.');
    return;
  }
  const groupedFlights = groupBy(flightsToUpdate, getGroupedFlightsKey);
  try {
    await Promise.map(
      Object.entries(groupedFlights),
      async ([key, flights]) => {
        console.log(`Updating flight ${key}...`);
        await updateFlightTimesData(flights);
        await updateFlightRegistrationData(flights);
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
  } catch (err) {
    console.error(err);
  }
};

const updateFlights = async (): Promise<void> => {
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
          iata: true,
          timeZone: true,
        },
      },
      arrivalAirport: {
        select: {
          iata: true,
          timeZone: true,
        },
      },
    },
  });
  await processFlightUpdate(flightsToUpdate);
};

const updateCurrentFlights = async (): Promise<void> => {
  const flightsToUpdate = await prisma.flight.findMany({
    where: {
      OR: [
        {
          inTimeActual: {
            gt: sub(new Date(), { minutes: 30 }),
            lte: add(new Date(), { minutes: 90 }),
          },
        },
        {
          inTime: {
            gt: sub(new Date(), { minutes: 30 }),
            lte: add(new Date(), { minutes: 90 }),
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
          iata: true,
          timeZone: true,
        },
      },
      arrivalAirport: {
        select: {
          iata: true,
          timeZone: true,
        },
      },
    },
  });
  const filteredFlights = flightsToUpdate.filter(({ inTime, inTimeActual }) => {
    const arrivalTime = inTimeActual ?? inTime;
    return (
      isAfter(arrivalTime, sub(new Date(), { minutes: 30 })) &&
      isBefore(arrivalTime, add(new Date(), { minutes: 90 }))
    );
  });
  await processFlightUpdate(filteredFlights);
};

(() => {
  scheduleJob('*/15 * * * *', updateFlights);
  scheduleJob('5,10,20,25,35,40,50,55 * * * *', updateCurrentFlights);
  scheduleJob('0 0 1 * *', async () => {
    await seedManufacturers();
    await seedAircraftTypes();
    await seedAirlines();
    await seedAirframes();
    await seedAirports();
  });
})();
