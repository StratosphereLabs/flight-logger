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

const SCRIPT_BEGIN = 'window.__data=';

const processData = (
  html: string,
): {
  data: FlightStatsOnTimePerformanceResponse | null;
  validFrom: string;
  validTo: string;
} => {
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
}: FetchOnTimePerformanceDataParams): Promise<
  | (FlightStatsOnTimePerformanceRating & {
      validFrom: string;
      validTo: string;
    })
  | null
> => {
  const url = `https://www.flightstats.com/v2/flight-ontime-performance-rating/${airlineIata}/${flightNumber}/${departureIata}`;
  const response = await axios.get<string>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const { data, validFrom, validTo } = processData(response.data);
  return data !== null
    ? {
        ...data?.OnTimePerformance.ratings[0],
        validFrom,
        validTo,
      }
    : null;
};
