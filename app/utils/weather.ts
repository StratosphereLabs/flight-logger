import { type LineSeries } from '@nivo/line';
import type { WeatherReport } from '@prisma/client';
import axios, { type AxiosResponse } from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import { TIMESTAMP_FORMAT_ISO } from '../constants';

export interface WeatherReportCloudCoverItem {
  [x: string]: string | number | null;
  cover: string;
  base: number | null;
}

export interface AviationWeatherReport {
  metar_id: number;
  icaoId: string;
  receiptTime: string;
  obsTime: number;
  reportTime: string;
  temp: number;
  dewp: number;
  wdir: string | number;
  wspd: number;
  wgst: number | null;
  visib: string | number;
  altim: number;
  slp: number | null;
  qcField: number;
  wxString: string | null;
  presTend: null;
  maxT: null;
  minT: null;
  maxT24: null;
  minT24: null;
  precip: null;
  pcp3hr: null;
  pcp6hr: null;
  pcp24hr: null;
  snow: null;
  vertVis: number | null;
  metarType: string;
  rawOb: string;
  mostRecent: number;
  lat: number;
  lon: number;
  elev: number;
  prior: number;
  name: string;
  clouds: WeatherReportCloudCoverItem[];
}

export interface WeatherReportData extends Omit<WeatherReport, 'clouds'> {
  clouds: WeatherReportCloudCoverItem[];
  chartData: {
    data: LineSeries[];
    max: number;
  };
}

const MAX_CLOUD_COLS = 16;

const getCloudColumns = (cover: string): number => {
  if (cover === 'FEW') return Math.round(MAX_CLOUD_COLS * 0.25);
  if (cover === 'SCT') return Math.round(MAX_CLOUD_COLS * 0.5);
  if (cover === 'BKN') return Math.round(MAX_CLOUD_COLS * 0.75);
  if (cover === 'OVC') return MAX_CLOUD_COLS;
  return 0;
};

const getRandomIntegers = (x: number, n: number): number[] => {
  const nums = new Set<number>();
  while (nums.size < x) {
    const rand = Math.floor(Math.random() * n) + 1;
    nums.add(rand);
  }
  return Array.from(nums);
};

export const getWeatherReportCloudCoverData = (
  weatherReport: WeatherReport | null,
): WeatherReportData | null => {
  const clouds =
    weatherReport?.clouds !== undefined &&
    typeof weatherReport.clouds === 'object' &&
    Array.isArray(weatherReport.clouds)
      ? (weatherReport.clouds as unknown as WeatherReportCloudCoverItem[])
      : [];
  const data = clouds.reduce<LineSeries[]>(
    (acc1, { cover, base }) =>
      base !== null
        ? [
            ...acc1,
            {
              id: base,
              data: getRandomIntegers(
                getCloudColumns(cover),
                MAX_CLOUD_COLS - 1,
              ).map(col => ({
                x: col,
                y: base / 100,
              })),
            },
          ]
        : acc1,
    [],
  );
  return weatherReport !== null
    ? {
        ...weatherReport,
        clouds,
        chartData: {
          data,
          max: MAX_CLOUD_COLS,
        },
      }
    : null;
};

const getUrl = (departureAirportId: string, departureTime: Date): string =>
  `https://aviationweather.gov/api/data/metar?ids=${departureAirportId}&format=json&date=${formatInTimeZone(departureTime, 'UTC', TIMESTAMP_FORMAT_ISO)}`;

export const fetchSingleWeatherReport = async (
  airportId: string,
  time: Date,
): Promise<AviationWeatherReport | null> => {
  let departureResult: AxiosResponse<AviationWeatherReport[]> | undefined;
  try {
    console.log(
      `Fetching weather report for ${airportId} at ${time.toISOString()}...`,
    );
    departureResult = await axios.get<AviationWeatherReport[]>(
      getUrl(airportId, time),
    );
  } catch (err) {
    console.log(
      `  Weather report not found for ${airportId} at ${time.toISOString()}.`,
    );
    console.error(err);
  }
  return departureResult?.data[0] ?? null;
};
