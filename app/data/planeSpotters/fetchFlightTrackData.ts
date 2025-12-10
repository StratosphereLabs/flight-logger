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

export const fetchFlightTrackData = async (
  flightData: FlightWithData,
  flightStatsUpdate?: FlightStatsFlightUpdateData,
): Promise<TracklogItem[] | undefined> => {
  const departureTime = flightData.outTimeActual ?? flightData.outTime;
  const airframeId = flightStatsUpdate?.airframeId ?? flightData.airframeId;
  if (
    airframeId === null ||
    isBefore(new Date(), departureTime) ||
    isAfter(sub(new Date(), { hours: 25 }), departureTime)
  )
    return undefined;
  const url = `https://planespotters.live/api/radar/trace/${airframeId}`;
  console.log(`  Fetching tracklog data from ${url}`);
  const response = await axios.get<{
    full: FlightTrackResult;
    recent: FlightTrackResult;
  }>(url, {
    headers: HEADERS,
    withCredentials: true,
  });
  const data = response.data;
  const lastFullTimestamp =
    data.full.trace.length > 0
      ? data.full.timestamp + data.full.trace[data.full.trace.length - 1][0]
      : data.full.timestamp;
  const fullTrackData = data.full.trace.reduce<FlightTrackResult['trace']>(
    (acc, [elapsedTime, ...item]) => {
      const currentTimestamp = data.full.timestamp + elapsedTime;
      const currentDate = new Date(1000 * currentTimestamp);
      const departureTime = flightData.outTimeActual ?? flightData.outTime;
      const arrivalTime = flightData.inTimeActual ?? flightData.inTime;
      return (item[7] !== null || item[2] === 'ground') &&
        isAfter(currentDate, sub(departureTime, { minutes: 5 })) &&
        isBefore(currentDate, add(arrivalTime, { minutes: 5 }))
        ? [[currentTimestamp, ...item], ...acc]
        : acc;
    },
    [],
  );
  const recentTrackData = data.recent.trace.reduce<FlightTrackResult['trace']>(
    (acc, [elapsedTime, ...item]) => {
      const currentTimestamp = data.recent.timestamp + elapsedTime;
      const currentDate = new Date(1000 * currentTimestamp);
      const departureTime = flightData.outTimeActual ?? flightData.outTime;
      const arrivalTime = flightData.inTimeActual ?? flightData.inTime;
      return (item[7] !== null || item[2] === 'ground') &&
        isAfter(currentDate, sub(departureTime, { minutes: 5 })) &&
        isBefore(currentDate, add(arrivalTime, { minutes: 5 })) &&
        data.recent.timestamp + elapsedTime > lastFullTimestamp
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
