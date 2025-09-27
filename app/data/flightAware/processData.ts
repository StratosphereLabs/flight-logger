import { load } from 'cheerio';

import type { FlightAwareDataResponse } from './types';

const SCRIPT_BEGIN = 'var trackpollBootstrap = ';

export const processData = (data: string): FlightAwareDataResponse | null => {
  const $ = load(data);
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
