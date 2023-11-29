import axios from 'axios';
import cheerio from 'cheerio';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { prisma } from '../db';

const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

export const fetchFlightAwareData = async (
  airlineIcao: string,
  flightNumber: number,
): Promise<Record<string, unknown> | null> => {
  const url = `https://www.flightaware.com/live/flight/${airlineIcao}${flightNumber}`;
  const response = await axios.get<string>(url);
  const $ = cheerio.load(response.data);
  let flightData: Record<string, unknown> | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      flightData = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').slice(0, -1),
      ) as Record<string, unknown>;
    }
  });
  return flightData;
};

export const fetchFlightInfo = async (): Promise<void> => {
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
  if (flightData.airline !== null && flightData.flightNumber !== null) {
    const data = await fetchFlightAwareData(
      flightData.airline.icao,
      flightData.flightNumber,
    );
    console.log(data);
  }
};

(() => {
  void fetchFlightInfo();
})();
