import { Promise } from 'bluebird';
import { add, isAfter, isBefore, sub } from 'date-fns';
import groupBy from 'lodash.groupby';
import { scheduleJob } from 'node-schedule';

import { prisma } from '../db';
import { seedDatabase } from '../db/seeders';
import { UPDATE_CONCURRENCY } from './constants';
import type { FlightWithData } from './types';
import { updateFlightData } from './updateFlightData';
import { updateFlightRegistrationData } from './updateFlightRegistrationData';
import { updateFlightTrackData } from './updateFlightTrackData';
import { getGroupedFlightsKey } from './utils';

const processFlightUpdate = async (
  flightsToUpdate: FlightWithData[],
  updateFn: (flights: FlightWithData[]) => Promise<void>,
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
      await updateFn(flights);
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
    await processFlightUpdate(flightsToUpdate, updateFlightData);
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
    await processFlightUpdate(flightsToUpdate, updateFlightData);
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
              gt: sub(new Date(), { hours: 2 }),
              lte: add(new Date(), { hours: 2 }),
            },
          },
          {
            outTime: {
              gt: sub(new Date(), { hours: 2 }),
              lte: add(new Date(), { hours: 2 }),
            },
          },
          {
            inTimeActual: {
              gt: sub(new Date(), { hours: 2 }),
              lte: add(new Date(), { hours: 2 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { hours: 2 }),
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
      ({ outTime, outTimeActual, inTime, inTimeActual }) => {
        const departureTime = outTimeActual ?? outTime;
        const arrivalTime = inTimeActual ?? inTime;
        return (
          (isAfter(new Date(), sub(departureTime, { hours: 2 })) &&
            isBefore(new Date(), add(departureTime, { hours: 2 }))) ||
          (isAfter(new Date(), sub(arrivalTime, { hours: 2 })) &&
            isBefore(new Date(), add(arrivalTime, { hours: 2 })))
        );
      },
    );
    await processFlightUpdate(filteredFlights, updateFlightData);
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

const updateFlightsEveryMinute = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        OR: [
          {
            outTimeActual: {
              gt: sub(new Date(), { hours: 1 }),
              lte: new Date(),
            },
          },
          {
            outTime: {
              gt: sub(new Date(), { hours: 1 }),
              lte: new Date(),
            },
          },
          {
            inTimeActual: {
              gt: new Date(),
              lte: add(new Date(), { hours: 1 }),
            },
          },
          {
            inTime: {
              gt: new Date(),
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
      ({ outTime, outTimeActual, inTime, inTimeActual }) => {
        const departureTime = outTimeActual ?? outTime;
        const arrivalTime = inTimeActual ?? inTime;
        return (
          (isAfter(new Date(), departureTime) &&
            isBefore(new Date(), add(departureTime, { hours: 1 }))) ||
          (isAfter(new Date(), sub(arrivalTime, { hours: 1 })) &&
            isBefore(new Date(), arrivalTime))
        );
      },
    );
    await processFlightUpdate(filteredFlights, async flights => {
      let updatedTimesFlights = flights;
      try {
        updatedTimesFlights =
          await updateFlightRegistrationData(updatedTimesFlights);
      } catch (err) {
        console.error(err);
      }
      try {
        await updateFlightTrackData(updatedTimesFlights);
      } catch (err) {
        console.error(err);
      }
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

const updateFlightsEvery15Seconds = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        OR: [
          {
            offTimeActual: {
              gt: sub(new Date(), { minutes: 30 }),
              lte: new Date(),
            },
          },
          {
            offTime: {
              gt: sub(new Date(), { minutes: 30 }),
              lte: new Date(),
            },
          },
          {
            onTimeActual: {
              gt: new Date(),
              lte: add(new Date(), { minutes: 30 }),
            },
          },
          {
            onTime: {
              gt: new Date(),
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
      ({ offTime, offTimeActual, outTime, onTime, onTimeActual, inTime }) => {
        const takeoffTime = offTimeActual ?? offTime ?? outTime;
        const landingTime = onTimeActual ?? onTime ?? inTime;
        return (
          (isAfter(new Date(), takeoffTime) &&
            isBefore(new Date(), add(takeoffTime, { minutes: 30 }))) ||
          (isAfter(new Date(), sub(landingTime, { minutes: 30 })) &&
            isBefore(new Date(), landingTime))
        );
      },
    );
    await processFlightUpdate(filteredFlights, async flights => {
      try {
        await updateFlightTrackData(flights);
      } catch (err) {
        console.error(err);
      }
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

(() => {
  scheduleJob('0 * * * *', updateFlightsHourly);
  scheduleJob('15,30,45 * * * *', updateFlightsEvery15);
  scheduleJob('5,10,20,25,35,40,50,55 * * * *', updateFlightsEvery5);
  scheduleJob(
    '1,2,3,4,6,7,8,9,11,12,13,14,16,17,18,19,21,22,23,24,26,27,28,29,31,32,33,34,36,37,38,39,41,42,43,44,46,47,48,49,51,52,53,54,56,57,58,59 * * * *',
    updateFlightsEveryMinute,
  );
  scheduleJob('15,30,45 * * * * *', updateFlightsEvery15Seconds);
  scheduleJob('0 0 1 * *', seedDatabase);
})();
