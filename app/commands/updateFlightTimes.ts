import axios from 'axios';
import cheerio from 'cheerio';
import { differenceInMinutes } from 'date-fns';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { prisma } from '../db';
import type { FlightAwareDataResponse } from './types';
import { createNewDate } from './utils';

const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

export const fetchFlightAwareData = async (
  airlineIcao: string,
  flightNumber: number,
): Promise<FlightAwareDataResponse | null> => {
  const url = `https://www.flightaware.com/live/flight/${airlineIcao}${flightNumber}`;
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
  const argv = await yargs(hideBin(process.argv)).parse();
  const flightId = argv._[0] as string;
  const flightData = await prisma.flight.findUnique({
    where: { id: flightId },
    include: {
      airline: true,
    },
  });
  if (flightData === null) {
    console.error('Flight not found.');
    process.exit(1);
  }
  if (flightData.airline === null) {
    console.error('Missing airline.');
    process.exit(1);
  }
  if (flightData.flightNumber === null) {
    console.error('Missing flight number.');
    process.exit(1);
  }
  const minutesFromNow = Math.abs(
    differenceInMinutes(new Date(), flightData.outTime),
  );
  if (minutesFromNow >= 720) {
    console.error('Flight must be within 12 hours.');
    process.exit(1);
  }
  const data = await fetchFlightAwareData(
    flightData.airline.icao,
    flightData.flightNumber,
  );
  if (data === null) {
    console.error('Unable to fetch flight data. Please try again later.');
    process.exit(1);
  }
  const flightAwareFlightData = Object.values(data.flights)[0];
  const outTimeScheduled = createNewDate(
    flightAwareFlightData.gateDepartureTimes.scheduled,
  );
  const timeDiff = Math.abs(
    differenceInMinutes(flightData.outTime, outTimeScheduled),
  );
  if (timeDiff >= 720) {
    console.error('Flight must be within 12 hours.');
    process.exit(1);
  }
  await prisma.flight.update({
    where: {
      id: flightId,
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
  console.log('Flight updated successfully.');
};

(() => {
  void updateFlightTimes();
})();
