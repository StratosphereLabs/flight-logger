import axios from 'axios';
import { isAfter, isBefore, sub } from 'date-fns';

import type { FlightWithData } from '../../commands/types';
import { HEADERS } from '../constants';
import type { TracklogItem } from '../types';

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
      number,
      number,
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
): Promise<TracklogItem[] | undefined> => {
  const departureTime = flightData.outTimeActual ?? flightData.outTime;
  if (
    flightData.airframeId === null ||
    isBefore(new Date(), departureTime) ||
    isAfter(sub(new Date(), { hours: 25 }), departureTime)
  )
    return undefined;
  const url = `https://planespotters.live/api/radar/trace/${flightData.airframeId}`;
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
      return (item[7] !== null || item[2] === 'ground') &&
        isAfter(currentDate, flightData.outTimeActual ?? flightData.outTime) &&
        isBefore(currentDate, flightData.inTimeActual ?? flightData.inTime)
        ? [[currentTimestamp, ...item], ...acc]
        : acc;
    },
    [],
  );
  const recentTrackData = data.recent.trace.reduce<FlightTrackResult['trace']>(
    (acc, [elapsedTime, ...item]) => {
      const currentTimestamp = data.recent.timestamp + elapsedTime;
      const currentDate = new Date(1000 * currentTimestamp);
      return (item[7] !== null || item[2] === 'ground') &&
        isAfter(currentDate, flightData.outTimeActual ?? flightData.outTime) &&
        isBefore(currentDate, flightData.inTimeActual ?? flightData.inTime) &&
        data.recent.timestamp + elapsedTime > lastFullTimestamp
        ? [[currentTimestamp, ...item], ...acc]
        : acc;
    },
    [],
  );
  const trackData = [...recentTrackData, ...fullTrackData];
  const currentFlightData: TracklogItem[] = [];
  for (const trackItem of trackData) {
    if (trackItem[3] === 'ground') {
      continue;
    }
    currentFlightData.unshift({
      timestamp: Math.round(trackItem[0]),
      coord: [trackItem[2], trackItem[1]],
      alt: typeof trackItem[3] === 'number' ? trackItem[3] / 100 : null,
      gs: trackItem[4],
    });
  }
  return currentFlightData;
};
