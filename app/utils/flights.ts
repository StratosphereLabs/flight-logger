import {
  type aircraft_type,
  type airframe,
  type airline,
  type airport,
  type flight,
  type region,
  type user,
} from '@prisma/client';
import { isAfter, isBefore } from 'date-fns';
import groupBy from 'lodash.groupby';
import { type LatLng } from '../types';
import { calculateCenterPoint, type Coordinates } from './coordinates';
import { getInFuture } from './datetime';
import { calculateDistance } from './distance';
import { type FlightTimestampsResult, getFlightTimestamps } from './flighttime';
import { excludeKeys } from './server';

export const flightIncludeObj = {
  user: true,
  departureAirport: {
    include: {
      region: true,
    },
  },
  arrivalAirport: {
    include: {
      region: true,
    },
  },
  airline: true,
  aircraftType: true,
  airframe: {
    include: {
      aircraftType: true,
      operator: true,
    },
  },
};

export interface AirframeData extends airframe {
  aircraftType: aircraft_type | null;
  operator: airline | null;
}

export interface AirportData extends airport {
  region: region;
}

export interface FlightData extends flight {
  user: user;
  departureAirport: AirportData;
  arrivalAirport: AirportData;
  airline: airline | null;
  aircraftType: aircraft_type | null;
  airframe: AirframeData | null;
}

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export type FlightWithAirports = flight & Route;

export type FlightDataWithTimestamps = FlightData & FlightTimestampsResult;

export interface RouteResult {
  airports: [airport, airport];
  frequency: number;
  isCompleted: boolean;
  inFuture: boolean;
}

export interface HeatmapResult extends LatLng {
  inFuture: boolean;
}

export interface FlightsResult extends Array<FlightWithAirports> {}

export interface FlightTimeDataResult
  extends Omit<FlightData, 'user'>,
    FlightTimestampsResult {
  user: Omit<
    user,
    'admin' | 'password' | 'id' | 'passwordResetToken' | 'passwordResetAt'
  >;
  distance: number;
  flightNumberString: string;
  link: string;
}

export const getCenterpoint = (result?: FlightsResult): Coordinates => {
  const airportMap: Record<string, airport> = {};
  if (result !== undefined) {
    for (const { departureAirport, arrivalAirport } of result) {
      airportMap[departureAirport.id] = departureAirport;
      airportMap[arrivalAirport.id] = arrivalAirport;
    }
  }
  const airports = Object.values(airportMap);
  return airports.length > 0
    ? calculateCenterPoint(airports.map(({ lat, lon }) => ({ lat, lng: lon })))
    : { lat: 0, lng: 0 };
};

export const getHeatmap = (result?: FlightsResult): HeatmapResult[] =>
  result?.flatMap(flight => [
    {
      inFuture: getInFuture(flight.outTime),
      lat: flight.departureAirport.lat,
      lng: flight.departureAirport.lon,
    },
    {
      inFuture: getInFuture(flight.inTime),
      lat: flight.arrivalAirport.lat,
      lng: flight.arrivalAirport.lon,
    },
  ]) ?? [];

export const getRoutes = (result?: FlightsResult): RouteResult[] => {
  const groupedFlights = groupBy(
    result,
    ({ departureAirport, arrivalAirport }) =>
      [departureAirport.id, arrivalAirport.id].sort().join('-'),
  );
  return Object.values(groupedFlights).map(flights => ({
    airports: [flights[0].departureAirport, flights[0].arrivalAirport],
    frequency: flights.length,
    isCompleted: flights.some(({ outTime }) => !getInFuture(outTime)),
    inFuture: flights.some(({ outTime }) => getInFuture(outTime)),
  }));
};

export const transformFlightData = (
  flight: FlightData,
): FlightTimeDataResult => {
  const timestamps = getFlightTimestamps({
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    duration: flight.duration,
    outTime: flight.outTime,
    outTimeActual: flight.outTimeActual ?? undefined,
    inTime: flight.inTime,
    inTimeActual: flight.inTimeActual ?? undefined,
  });
  const flightDistance = calculateDistance(
    flight.departureAirport.lat,
    flight.departureAirport.lon,
    flight.arrivalAirport.lat,
    flight.arrivalAirport.lon,
  );
  return {
    ...flight,
    ...timestamps,
    user: excludeKeys(
      flight.user,
      'admin',
      'password',
      'id',
      'passwordResetToken',
      'passwordResetAt',
    ),
    tailNumber: flight.airframe?.registration ?? flight.tailNumber,
    flightNumberString:
      flight.flightNumber !== null
        ? `${flight.airline?.iata ?? flight.airline?.icao ?? ''} ${
            flight.flightNumber
          }`.trim()
        : '',
    distance: Math.round(flightDistance),
    link: `/user/${flight.user.username}/flights/${flight.id}`,
  };
};

export const getCurrentFlight = (
  flights: FlightData[],
): FlightTimeDataResult | undefined => {
  const currentFlight = flights.find((currentFlight, index, allFlights) => {
    const departureTime = currentFlight.outTimeActual ?? currentFlight.outTime;
    const arrivalTime = currentFlight.inTimeActual ?? currentFlight.inTime;
    if (
      isBefore(departureTime, new Date()) &&
      isAfter(arrivalTime, new Date())
    ) {
      return true;
    }
    const nextFlight = allFlights[index + 1];
    if (nextFlight === undefined) return true;
    const nextFlightTime = nextFlight.outTimeActual ?? nextFlight.outTime;
    const layoverDuration = nextFlightTime.getTime() - arrivalTime.getTime();
    const midTime = arrivalTime.getTime() + layoverDuration / 3;
    return isAfter(midTime, new Date());
  });
  return currentFlight !== undefined
    ? transformFlightData(currentFlight)
    : undefined;
};
