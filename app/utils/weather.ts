import type { Prisma, WeatherReport } from '@prisma/client';
import axios, { type AxiosResponse } from 'axios';
import { fromUnixTime } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import type { FlightWithData } from '../commands/types';
import { TIMESTAMP_FORMAT_ISO } from '../constants';
import { prisma } from '../db';

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
}

export const getWeatherReportCloudCoverData = (
  weatherReport: WeatherReport | null,
): WeatherReportData | null =>
  weatherReport !== null
    ? {
        ...weatherReport,
        clouds:
          weatherReport.clouds !== null &&
          typeof weatherReport.clouds === 'object' &&
          Array.isArray(weatherReport.clouds)
            ? (weatherReport.clouds as unknown as WeatherReportCloudCoverItem[])
            : [],
      }
    : null;

const getUrl = (departureAirportId: string, departureTime: Date): string =>
  `https://aviationweather.gov/api/data/metar?ids=${departureAirportId}&format=json&date=${formatInTimeZone(departureTime, 'UTC', TIMESTAMP_FORMAT_ISO)}`;

const fetchSingleReport = async (
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
    console.log(
      `  Found ${departureResult.data.length} result${departureResult.data.length !== 1 ? 's' : ''} for ${airportId} at ${time.toISOString()}.`,
    );
  } catch (err) {
    console.log(
      `  Unable to fetch weather report for ${airportId} at ${time.toISOString()}.`,
    );
    console.error(err);
  }
  return departureResult?.data[0] ?? null;
};

const getUpdateObject = (
  data: AviationWeatherReport,
): Prisma.WeatherReportCreateInput => ({
  id: data.metar_id,
  airport: {
    connect: {
      id: data.icaoId,
    },
  },
  obsTime: fromUnixTime(data.obsTime),
  temp: data.temp,
  dewp: data.dewp,
  wdir: data.wdir.toString(),
  wspd: data.wspd,
  wgst: data.wgst ?? 0,
  visib: data.visib.toString(),
  altim: data.altim,
  wxString: data.wxString,
  vertVis: data.vertVis,
  rawOb: data.rawOb,
  clouds: data.clouds,
});

export const updateFlightWeatherReports = async (
  flights: FlightWithData[],
): Promise<void> => {
  const {
    airline,
    flightNumber,
    departureAirport,
    arrivalAirport,
    diversionAirportId,
    inTime,
    inTimeActual,
    offTime,
    offTimeActual,
    onTime,
    onTimeActual,
    outTime,
    outTimeActual,
  } = flights[0];
  const departureTime = offTimeActual ?? offTime ?? outTimeActual ?? outTime;
  const arrivalTime = onTimeActual ?? onTime ?? inTimeActual ?? inTime;
  const departureWeather: AviationWeatherReport | null =
    await fetchSingleReport(departureAirport.id, departureTime);
  const arrivalWeather: AviationWeatherReport | null = await fetchSingleReport(
    arrivalAirport.id,
    arrivalTime,
  );
  let diversionWeather: AviationWeatherReport | null = null;
  if (diversionAirportId !== null) {
    diversionWeather = await fetchSingleReport(diversionAirportId, arrivalTime);
  }
  if (
    departureWeather === null &&
    arrivalWeather === null &&
    diversionWeather === null
  ) {
    return;
  }
  console.log(
    `Updating weather data for ${airline?.iata}${flightNumber} ${departureAirport.iata}-${arrivalAirport.iata} at ${outTime.toISOString()}...`,
  );
  await prisma.$transaction(
    flights.map(({ id }) =>
      prisma.flight.update({
        where: { id },
        data: {
          departureWeather:
            departureWeather !== null
              ? {
                  connectOrCreate: {
                    where: {
                      id: departureWeather.metar_id,
                    },
                    create: getUpdateObject(departureWeather),
                  },
                }
              : undefined,
          arrivalWeather:
            arrivalWeather !== null
              ? {
                  connectOrCreate: {
                    where: {
                      id: arrivalWeather.metar_id,
                    },
                    create: getUpdateObject(arrivalWeather),
                  },
                }
              : undefined,
          diversionWeather:
            diversionWeather !== null
              ? {
                  connectOrCreate: {
                    where: {
                      id: diversionWeather.metar_id,
                    },
                    create: getUpdateObject(diversionWeather),
                  },
                }
              : undefined,
        },
      }),
    ),
  );
};
