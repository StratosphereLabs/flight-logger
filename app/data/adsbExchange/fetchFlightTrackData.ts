import axios from 'axios';
import { add, isAfter, isBefore, sub } from 'date-fns';

import { HEADERS } from '../constants';
import { type FlightStatsFlightUpdateData } from '../flightStats';
import type { FlightWithData, TracklogItem } from '../types';

interface FlightTrackItemData {
  alert: number;
  alt_geom: number;
  baro_rate: number;
  category: string;
  emergency: string;
  flight: string;
  gva: number;
  nac_p: number;
  nac_v: number;
  nav_altitude_mcp: number;
  nav_modes: string[];
  nav_qnh: number;
  nic: number;
  nic_baro: number;
  rc: number;
  sda: number;
  sil: number;
  sil_type: string;
  spi: number;
  squawk: string;
  track: number;
  type: string;
  version: number;
}

interface FlightTrackResult {
  dbFlags: number;
  desc: string;
  icao: string;
  ownOp: string;
  r: string;
  t: string;
  timestamp: number;
  trace: Array<
    [
      number,
      number | null,
      number | null,
      number | 'ground',
      number | null,
      number | null,
      number,
      number | null,
      FlightTrackItemData | null,
      string,
      number,
      number | null,
      null,
      null,
      string,
    ]
  >;
  year: string;
}

const FULL_HEADERS = {
  ...HEADERS,
  Accept: 'application/json',
  Referer: 'https://globe.adsbexchange.com/',
};

export const fetchFlightTrackData = async (
  flightData: FlightWithData,
  flightStatsUpdate?: FlightStatsFlightUpdateData,
): Promise<TracklogItem[] | undefined> => {
  const airframeId = flightStatsUpdate?.airframeId ?? flightData.airframeId;
  if (
    airframeId === null ||
    flightData.outTimeActual === null ||
    flightData.inTimeActual === null ||
    isBefore(new Date(), flightData.outTimeActual) ||
    isAfter(sub(new Date(), { hours: 25 }), flightData.outTimeActual)
  )
    return undefined;
  const fullUrl = `https://globe.adsbexchange.com/data/traces/${airframeId.slice(4)}/trace_full_${airframeId}.json`;
  const recentUrl = `https://globe.adsbexchange.com/data/traces/${airframeId.slice(4)}/trace_recent_${airframeId}.json`;
  console.log(`  Fetching full tracklog data from ${fullUrl}`);
  console.log(`  Fetching recent tracklog data from ${recentUrl}`);
  const [fullResponse, recentResponse] = await Promise.all([
    axios.get<FlightTrackResult>(fullUrl, {
      headers: FULL_HEADERS,
      withCredentials: true,
    }),
    axios.get<FlightTrackResult>(recentUrl, {
      headers: FULL_HEADERS,
      withCredentials: true,
    }),
  ]);
  const fullData = fullResponse.data;
  const recentData = recentResponse.data;
  const lastFullTimestamp =
    fullData.trace.length > 0
      ? fullData.timestamp + fullData.trace[fullData.trace.length - 1][0]
      : fullData.timestamp;
  const fullTrackData = fullData.trace.reduce<FlightTrackResult['trace']>(
    (acc, [elapsedTime, ...item]) => {
      const currentTimestamp = fullData.timestamp + elapsedTime;
      const currentDate = new Date(1000 * currentTimestamp);
      return (item[7] !== null || item[2] === 'ground') &&
        flightData.outTimeActual !== null &&
        flightData.inTimeActual !== null &&
        isAfter(currentDate, sub(flightData.outTimeActual, { minutes: 5 })) &&
        isBefore(currentDate, add(flightData.inTimeActual, { minutes: 5 }))
        ? [[currentTimestamp, ...item], ...acc]
        : acc;
    },
    [],
  );
  const recentTrackData = recentData.trace.reduce<FlightTrackResult['trace']>(
    (acc, [elapsedTime, ...item]) => {
      const currentTimestamp = recentData.timestamp + elapsedTime;
      const currentDate = new Date(1000 * currentTimestamp);
      return (item[7] !== null || item[2] === 'ground') &&
        flightData.outTimeActual !== null &&
        flightData.inTimeActual !== null &&
        isAfter(currentDate, sub(flightData.outTimeActual, { minutes: 5 })) &&
        isBefore(currentDate, add(flightData.inTimeActual, { minutes: 5 })) &&
        recentData.timestamp + elapsedTime > lastFullTimestamp
        ? [[currentTimestamp, ...item], ...acc]
        : acc;
    },
    [],
  );
  const trackData = [...recentTrackData, ...fullTrackData];
  const currentFlightData: TracklogItem[] = [];
  for (const trackItem of trackData) {
    if (trackItem[2] !== null && trackItem[1] !== null) {
      currentFlightData.unshift({
        timestamp: Math.round(trackItem[0]),
        coord: [trackItem[2], trackItem[1]],
        alt: typeof trackItem[3] === 'number' ? trackItem[3] / 100 : null,
        gs: trackItem[4],
        ground: trackItem[3] === 'ground',
      });
    }
  }
  return currentFlightData;
};
