import axios from 'axios';
import { Promise } from 'bluebird';
import cheerio from 'cheerio';
import { add, differenceInMinutes, sub } from 'date-fns';
import groupBy from 'lodash.groupby';
import { prisma } from '../db';
import { UPDATE_CONCURRENCY, HEADERS } from './constants';
import type { FlightAwareDataResponse } from './types';
import { createNewDate } from './utils';

const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

export const fetchFlightAwareData = async (
  callsign: string,
): Promise<FlightAwareDataResponse | null> => {
  const url = `https://www.flightaware.com/live/flight/${callsign}`;
  const response = await axios.get<string>(url, { headers: HEADERS });
  const $ = cheerio.load(response.data);
  let flightData: FlightAwareDataResponse | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      flightData = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').slice(0, -1),
      ) as FlightAwareDataResponse;
    }
  });
  return flightData;
};

export const updateFlightTimes = async (): Promise<void> => {
  const flights = await prisma.flight.findMany({
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
    },
  });
  if (flights.length === 0) {
    console.log('No flights to update.');
    process.exit(0);
  }
  const groupedFlights = groupBy(
    flights,
    ({ airline, flightNumber }) => `${airline?.icao}${flightNumber}`,
  );
  await Promise.map(
    Object.entries(groupedFlights),
    async ([callsign, flights]) => {
      console.log(`Updating flight ${callsign}...`);
      const data = await fetchFlightAwareData(callsign);
      if (data === null) {
        console.error('  Unable to fetch flight data. Please try again later.');
        return;
      }
      const flightAwareFlightData = Object.values(data.flights)[0];
      const outTimeScheduled = createNewDate(
        flightAwareFlightData.gateDepartureTimes.scheduled,
      );
      const timeDiff = Math.abs(
        differenceInMinutes(flights[0].outTime, outTimeScheduled),
      );
      if (timeDiff >= 720) {
        console.error('  Flight must be within 12 hours.');
        return;
      }
      await prisma.flight.updateMany({
        where: {
          id: {
            in: flights.map(({ id }) => id),
          },
        },
        data: {
          outTime: outTimeScheduled,
          outTimeActual: createNewDate(
            flightAwareFlightData.gateDepartureTimes.actual ??
              flightAwareFlightData.gateDepartureTimes.estimated,
          ),
          offTime: createNewDate(flightAwareFlightData.takeoffTimes.scheduled),
          offTimeActual: createNewDate(
            flightAwareFlightData.takeoffTimes.actual ??
              flightAwareFlightData.takeoffTimes.estimated,
          ),
          onTime: createNewDate(flightAwareFlightData.landingTimes.scheduled),
          onTimeActual: createNewDate(
            flightAwareFlightData.landingTimes.actual ??
              flightAwareFlightData.landingTimes.estimated,
          ),
          inTime: createNewDate(
            flightAwareFlightData.gateArrivalTimes.scheduled,
          ),
          inTimeActual: createNewDate(
            flightAwareFlightData.gateArrivalTimes.actual ??
              flightAwareFlightData.gateArrivalTimes.estimated,
          ),
        },
      });
    },
    {
      concurrency: UPDATE_CONCURRENCY,
    },
  );
  console.log(
    `  ${flights.length} flight${
      flights.length > 1 ? 's' : ''
    } updated successfully.`,
  );
};

(() => {
  void updateFlightTimes();
})();
