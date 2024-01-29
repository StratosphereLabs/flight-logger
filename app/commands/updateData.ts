import type { airline, flight } from '@prisma/client';
import { Promise } from 'bluebird';
import { add, sub } from 'date-fns';
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
import { updateFlightRegistrationData } from './flightRadar';
import { updateFlightTimesData } from './flightStats';
import { getGroupedFlightsKey } from './utils';

export interface FlightWithDataAirport {
  iata: string;
  timeZone: string;
}

export type FlightWithData = flight & {
  airline: airline | null;
  departureAirport: FlightWithDataAirport;
  arrivalAirport: FlightWithDataAirport;
};

const updateFlights = async (): Promise<void> => {
  const flightsToUpdate = await prisma.flight.findMany({
    where: {
      outTime: {
        gt: sub(new Date(), { days: 1 }),
        lt: add(new Date(), { days: 1 }),
      },
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

(() => {
  scheduleJob('*/15 * * * *', updateFlights);
  scheduleJob('0 0 1 * *', async () => {
    await seedManufacturers();
    await seedAircraftTypes();
    await seedAirlines();
    await seedAirframes();
    await seedAirports();
  });
})();
