import { type WithRequired } from '@tanstack/react-query';
import { add, isAfter, isBefore, sub } from 'date-fns';
import groupBy from 'lodash.groupby';
import { scheduleJob } from 'node-schedule';

import { getFlightAwareFlightUpdate } from '../data/flightAware';
import { getFlightRadarFlightUpdate } from '../data/flightRadar';
import { getFlightStatsFlightUpdate } from '../data/flightStats';
import type { FlightUpdateInput } from '../data/types';
import { prisma } from '../db';
import { seedDatabase } from '../db/seeders';
import type { FlightWithData } from './types';
import { updateFlightTrackData } from './updateFlightTrackData';
import { updateFlightWeatherReports } from './updateFlightWeatherReports';
import { updateOnTimePerformanceData } from './updateOnTimePerformanceData';
import { updateTrackAircraftData } from './updateTrackAircraftData';
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
  for (const [key, flights] of Object.entries(groupedFlights)) {
    console.log(`Updating flight ${key}...`);
    await updateFn(flights);
  }
  console.log(
    `  ${flightsToUpdate.length} flight${
      flightsToUpdate.length > 1 ? 's' : ''
    } updated successfully.`,
  );
};

/**
 * Bucket #2 - Daily
 * 7 days before scheduled departure - 3 days after arrival
 */
const updateFlightsDaily = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        outTime: {
          lte: add(new Date(), { days: 7 }),
        },
        OR: [
          {
            inTimeActual: {
              gt: sub(new Date(), { days: 3 }),
            },
          },
          {
            inTime: {
              gt: sub(new Date(), { days: 3 }),
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
    await processFlightUpdate(flightsToUpdate, async flights => {
      const firstFlight = flights[0] as WithRequired<
        FlightWithData,
        'flightNumber' | 'airline'
      >;
      let flightStatsUpdate: FlightUpdateInput | null = null;
      let flightRadarUpdate: FlightUpdateInput | null = null;
      let flightAwareUpdate: FlightUpdateInput | null = null;
      if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
        try {
          flightStatsUpdate = await getFlightStatsFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
        try {
          flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTAWARE === 'true') {
        try {
          flightAwareUpdate = await getFlightAwareFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      console.log({ flightStatsUpdate, flightRadarUpdate, flightAwareUpdate });
      const flightsWithUserId = flights.filter(({ userId }) => userId !== null);
      if (flightsWithUserId.length > 0) {
        try {
          await updateTrackAircraftData(flightsWithUserId);
        } catch (err) {
          console.error(err);
        }
      }
      try {
        await updateFlightTrackData(flights);
      } catch (err) {
        console.error(err);
      }
      try {
        await updateOnTimePerformanceData(flights);
      } catch (err) {
        console.error(err);
      }
      try {
        await updateFlightWeatherReports(flights);
      } catch (err) {
        console.error(err);
      }
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
const updateFlightsHourly = async (): Promise<void> => {
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
    await processFlightUpdate(flightsToUpdate, async flights => {
      const firstFlight = flights[0] as WithRequired<
        FlightWithData,
        'flightNumber' | 'airline'
      >;
      let flightStatsUpdate: FlightUpdateInput | null = null;
      let flightRadarUpdate: FlightUpdateInput | null = null;
      let flightAwareUpdate: FlightUpdateInput | null = null;
      if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
        try {
          flightStatsUpdate = await getFlightStatsFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
        try {
          flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTAWARE === 'true') {
        try {
          flightAwareUpdate = await getFlightAwareFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      console.log({ flightStatsUpdate, flightRadarUpdate, flightAwareUpdate });
      const flightsWithUserId = flights.filter(({ userId }) => userId !== null);
      if (flightsWithUserId.length > 0) {
        try {
          await updateTrackAircraftData(flightsWithUserId);
        } catch (err) {
          console.error(err);
        }
      }
      try {
        await updateFlightTrackData(flights);
      } catch (err) {
        console.error(err);
      }
      try {
        await updateFlightWeatherReports(flights);
      } catch (err) {
        console.error(err);
      }
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
const updateFlightsEvery15 = async (): Promise<void> => {
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
    await processFlightUpdate(flightsToUpdate, async flights => {
      const firstFlight = flights[0] as WithRequired<
        FlightWithData,
        'flightNumber' | 'airline'
      >;
      let flightStatsUpdate: FlightUpdateInput | null = null;
      let flightRadarUpdate: FlightUpdateInput | null = null;
      let flightAwareUpdate: FlightUpdateInput | null = null;
      if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
        try {
          flightStatsUpdate = await getFlightStatsFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
        try {
          flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTAWARE === 'true') {
        try {
          flightAwareUpdate = await getFlightAwareFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      console.log({ flightStatsUpdate, flightRadarUpdate, flightAwareUpdate });
      try {
        await updateFlightTrackData(flights);
      } catch (err) {
        console.error(err);
      }
      try {
        await updateFlightWeatherReports(flights);
      } catch (err) {
        console.error(err);
      }
    });
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Bucket #5 - Every 5 minutes
 * 2 hours before departure - 1 hour after departure
 * 2 hours before arrival - 1 hour after arrival
 */
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
      const firstFlight = flights[0] as WithRequired<
        FlightWithData,
        'flightNumber' | 'airline'
      >;
      let flightStatsUpdate: FlightUpdateInput | null = null;
      let flightRadarUpdate: FlightUpdateInput | null = null;
      let flightAwareUpdate: FlightUpdateInput | null = null;
      if (process.env.DATASOURCE_FLIGHTSTATS === 'true') {
        try {
          flightStatsUpdate = await getFlightStatsFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTRADAR === 'true') {
        try {
          flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      if (process.env.DATASOURCE_FLIGHTAWARE === 'true') {
        try {
          flightAwareUpdate = await getFlightAwareFlightUpdate(firstFlight);
        } catch (err) {
          console.error(err);
        }
      }
      console.log({ flightStatsUpdate, flightRadarUpdate, flightAwareUpdate });
      try {
        await updateFlightTrackData(flights);
      } catch (err) {
        console.error(err);
      }
      try {
        await updateFlightWeatherReports(flights);
      } catch (err) {
        console.error(err);
      }
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
const updateFlightsEveryMinute = async (): Promise<void> => {
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
          (isAfter(new Date(), sub(departureTime, { minutes: 5 })) &&
            isBefore(new Date(), add(departureTime, { hours: 1 }))) ||
          (isAfter(new Date(), sub(arrivalTime, { hours: 1 })) &&
            isBefore(new Date(), add(arrivalTime, { minutes: 5 })))
        );
      },
    );
    await processFlightUpdate(filteredFlights, async flights => {
      const firstFlight = flights[0] as WithRequired<
        FlightWithData,
        'flightNumber' | 'airline'
      >;
      let flightRadarUpdate: FlightUpdateInput | null = null;
      try {
        flightRadarUpdate = await getFlightRadarFlightUpdate(firstFlight);
      } catch (err) {
        console.error(err);
      }
      console.log({ flightRadarUpdate });
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

/**
 * Bucket #7 - Every 15 seconds
 * 1 minute before takeoff - 30 min after takeoff
 * 30 min before landing - 1 minute after landing
 */
const updateFlightsEvery15Seconds = async (): Promise<void> => {
  try {
    const flightsToUpdate = await prisma.flight.findMany({
      where: {
        OR: [
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
        const takeoffTime =
          offTimeActual ?? offTime ?? outTimeActual ?? outTime;
        const landingTime = onTimeActual ?? onTime ?? inTimeActual ?? inTime;
        return (
          (isAfter(new Date(), sub(takeoffTime, { minutes: 1 })) &&
            isBefore(new Date(), add(takeoffTime, { minutes: 30 }))) ||
          (isAfter(new Date(), sub(landingTime, { minutes: 30 })) &&
            isBefore(new Date(), add(landingTime, { minutes: 1 })))
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
  // Seed database at midnight on 1st day of each month
  scheduleJob('0 0 1 * *', seedDatabase);

  // Update flights at midnight every day EXCEPT on 1st day of each month
  scheduleJob('0 0 2-31 * *', updateFlightsDaily);

  // Update flights at top of every hour EXCEPT at midnight
  scheduleJob('0 1-23 * * *', updateFlightsHourly);

  // Update flights every 15 minutes EXCEPT at the top of each hour
  scheduleJob('15,30,45 * * * *', updateFlightsEvery15);

  // Update flights every 5 minutes EXCEPT at 15 minute intervals
  scheduleJob('5,10,20,25,35,40,50,55 * * * *', updateFlightsEvery5);

  // Update flights every minute EXCEPT at 5 minute intervals
  scheduleJob(
    '1,2,3,4,6,7,8,9,11,12,13,14,16,17,18,19,21,22,23,24,26,27,28,29,31,32,33,34,36,37,38,39,41,42,43,44,46,47,48,49,51,52,53,54,56,57,58,59 * * * *',
    updateFlightsEveryMinute,
  );

  // Update flights every 15 seconds EXCEPT at the top of each minute
  scheduleJob('15,30,45 * * * * *', updateFlightsEvery15Seconds);
})();
