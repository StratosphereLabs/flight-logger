import type { WeatherReport } from '@prisma/client';
import axios, { type AxiosResponse } from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import type { FlightWithData } from '../commands/types';
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

export const getUrl = (
  departureAirportId: string,
  departureTime: Date,
): string =>
  `https://aviationweather.gov/api/data/metar?ids=${departureAirportId}&format=json&date=${formatInTimeZone(departureTime, 'UTC', TIMESTAMP_FORMAT_ISO)}`;

export const fetchWeatherReports = async (
  flights: FlightWithData[],
): Promise<Array<{
  id: string;
  departureWeather: AviationWeatherReport | null;
  arrivalWeather: AviationWeatherReport | null;
  diversionWeather: AviationWeatherReport | null;
}> | null> =>
  await Promise.all(
    flights.map(
      async ({
        id,
        arrivalAirportId,
        departureAirportId,
        diversionAirportId,
        inTime,
        inTimeActual,
        offTime,
        offTimeActual,
        onTime,
        onTimeActual,
        outTime,
        outTimeActual,
      }) => {
        const departureTime =
          offTimeActual ?? offTime ?? outTimeActual ?? outTime;
        const arrivalTime = onTimeActual ?? onTime ?? inTimeActual ?? inTime;
        let departureResult: AxiosResponse<AviationWeatherReport[]> | null =
          null;
        try {
          departureResult = await axios.get<AviationWeatherReport[]>(
            getUrl(departureAirportId, departureTime),
          );
        } catch (err) {
          console.error(err);
        }
        let arrivalResult: AxiosResponse<AviationWeatherReport[]> | null = null;
        try {
          arrivalResult = await axios.get<AviationWeatherReport[]>(
            getUrl(arrivalAirportId, arrivalTime),
          );
        } catch (err) {
          console.error(err);
        }
        let diversionResult: AxiosResponse<AviationWeatherReport[]> | null =
          null;
        if (diversionAirportId !== null) {
          try {
            diversionResult = await axios.get<AviationWeatherReport[]>(
              getUrl(diversionAirportId, arrivalTime),
            );
          } catch (err) {
            console.error(err);
          }
        }
        return {
          id,
          departureWeather: departureResult?.data[0] ?? null,
          arrivalWeather: arrivalResult?.data[0] ?? null,
          diversionWeather: diversionResult?.data[0] ?? null,
        };
      },
    ),
  );
