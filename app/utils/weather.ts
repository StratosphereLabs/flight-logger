import axios from 'axios';
import { fromUnixTime } from 'date-fns';

import { prisma } from '../db';

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
  clouds: Array<{
    cover: string;
    base: number;
  }>;
}

export const fetchWeatherReportsByAirportIds = async (
  airportIds: string[],
): Promise<AviationWeatherReport[] | null> => {
  try {
    const response = await axios.get<AviationWeatherReport[]>(
      `https://aviationweather.gov/api/data/metar?ids=${airportIds.join(',')}&format=json`,
    );
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const saveWeatherReports = async (
  airportIds: string[],
): Promise<void> => {
  const airportList = airportIds.join(',');
  console.log(`Fetching weather reports for ${airportList}...`);
  const weatherData = await fetchWeatherReportsByAirportIds(airportIds);
  if (weatherData !== null) {
    console.log(`  Saving weather reports for ${airportList} to database...`);
    await prisma.weatherReport.createMany({
      data: weatherData.map(data => ({
        id: data.metar_id,
        airportId: data.icaoId,
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
      })),
      skipDuplicates: true,
    });
  } else {
    console.error(`  Unable to fetch weather reports for ${airportList}`);
  }
};
