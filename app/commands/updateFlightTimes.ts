import type { airline } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';
import { add, differenceInMinutes, sub } from 'date-fns';
import { prisma } from '../db';
import type { FlightAwareDataResponse } from './types';
import { createNewDate } from './utils';

const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

export const fetchFlightAwareData = async (
  airline: airline,
  flightNumber: number,
): Promise<FlightAwareDataResponse | null> => {
  const url = `https://www.flightaware.com/live/flight/${airline.icao}${flightNumber}`;
  const response = await axios.get<string>(url);
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
    },
    include: {
      airline: true,
    },
  });
  if (flights.length === 0) {
    console.log('No flights to update.');
    process.exit(0);
  }
  for (const flightData of flights) {
    console.log(`Updating flight ${flightData.id}...`);
    if (flightData.airline === null) {
      continue;
    }
    if (flightData.flightNumber === null) {
      continue;
    }
    const data = await fetchFlightAwareData(
      flightData.airline,
      flightData.flightNumber,
    );
    if (data === null) {
      console.error('  Unable to fetch flight data. Please try again later.');
      continue;
    }
    const flightAwareFlightData = Object.values(data.flights)[0];
    const outTimeScheduled = createNewDate(
      flightAwareFlightData.gateDepartureTimes.scheduled,
    );
    const timeDiff = Math.abs(
      differenceInMinutes(flightData.outTime, outTimeScheduled),
    );
    if (timeDiff >= 720) {
      console.error('  Flight must be within 12 hours.');
      continue;
    }
    await prisma.flight.update({
      where: {
        id: flightData.id,
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
        inTime: createNewDate(flightAwareFlightData.gateArrivalTimes.scheduled),
        inTimeActual: createNewDate(
          flightAwareFlightData.gateArrivalTimes.actual ??
            flightAwareFlightData.gateArrivalTimes.estimated,
        ),
      },
    });
  }
  console.log('  Flight updated successfully.');
};

(() => {
  void updateFlightTimes();
})();
