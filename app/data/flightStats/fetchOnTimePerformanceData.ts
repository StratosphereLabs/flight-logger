import axios from 'axios';
import { load } from 'cheerio';
import { format, parse } from 'date-fns';

import {
  DATE_FORMAT_ISO,
  ON_TIME_PERFORMANCE_DATE_FORMAT,
} from '../../constants';
import { HEADERS } from '../constants';
import type { FetchOnTimePerformanceDataParams } from '../types';
import type {
  FlightStatsOnTimePerformanceRating,
  FlightStatsOnTimePerformanceResponse,
} from './types';

export interface OnTimePerformanceData extends FlightStatsOnTimePerformanceRating {
  validFrom: string;
  validTo: string;
}

const SCRIPT_BEGIN = 'window.__data=';

const processData = (
  html: string,
): {
  data: FlightStatsOnTimePerformanceResponse;
  validFrom: string;
  validTo: string;
} | null => {
  const $ = load(html);
  let data: FlightStatsOnTimePerformanceResponse | null = null;
  $('script').each((_, script) => {
    const text = $(script).text();
    if (text.includes(SCRIPT_BEGIN)) {
      data = JSON.parse(
        text.replace(SCRIPT_BEGIN, '').slice(0, -1),
      ) as FlightStatsOnTimePerformanceResponse;
    }
  });
  const dateRangeText = $('p.date-subtitle').text();
  if (data === null || dateRangeText === '') {
    return null;
  }
  const [fromDateString, toDateString] = dateRangeText.split(' to ');
  const validFromDate = format(
    parse(fromDateString, ON_TIME_PERFORMANCE_DATE_FORMAT, new Date()),
    DATE_FORMAT_ISO,
  );
  const validToDate = format(
    parse(toDateString, ON_TIME_PERFORMANCE_DATE_FORMAT, new Date()),
    DATE_FORMAT_ISO,
  );
  return {
    data,
    validFrom: `${validFromDate}T00:00:00.000Z`,
    validTo: `${validToDate}T23:59:59.999Z`,
  };
};

export const fetchOnTimePerformanceData = async ({
  airlineIata,
  flightNumber,
  departureIata,
}: FetchOnTimePerformanceDataParams): Promise<OnTimePerformanceData | null> => {
  const url = `https://www.flightstats.com/v2/flight-ontime-performance-rating/${airlineIata}/${flightNumber}/${departureIata}`;
  console.log(`  Fetching on-time performance data from ${url}`);
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const onTimeData = processData(response.data);
  return onTimeData !== null
    ? {
        ...onTimeData.data.OnTimePerformance.ratings[0],
        validFrom: onTimeData.validFrom,
        validTo: onTimeData.validTo,
      }
    : null;
};
