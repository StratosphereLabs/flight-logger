import type { airline, flight } from '@prisma/client';
import { Promise } from 'bluebird';
import { add, sub } from 'date-fns';
import groupBy from 'lodash.groupby';
import { scheduleJob } from 'node-schedule';
import { prisma } from '../db';
import { seedAirframes } from '../db/seeders/seedAirframes';
import { UPDATE_CONCURRENCY } from './constants';
import { updateFlightTimes } from './flightAware';
import { updateFlightRegistrations } from './flightRadar';
import { getGroupedFlightsKey } from './utils';

export type FlightWithData = flight & {
  airline: airline | null;
  departureAirport: {
    iata: string;
  };
  arrivalAirport: {
    iata: string;
  };
};

const updateFlights = async (): Promise<void> => {
  const flightsToUpdate = await prisma.flight.findMany({
    where: {
      outTime: {
        gt: sub(new Date(), { hours: 12 }),
        lt: add(new Date(), { hours: 12 }),
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
        },
      },
      arrivalAirport: {
        select: {
          iata: true,
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
        await updateFlightTimes(flights);
        await updateFlightRegistrations(flights);
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
  scheduleJob('0 0 1 * *', seedAirframes);
})();
