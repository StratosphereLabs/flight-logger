import {
  type aircraft_type,
  type airframe,
  type airline,
  type airport,
  type flight,
  type user,
} from '@prisma/client';
import groupBy from 'lodash.groupby';
import { type LatLng } from '../types';
import { calculateCenterPoint, type Coordinates } from './coordinates';
import { getInFuture } from './datetime';
import { calculateDistance } from './distance';
import { type FlightTimestampsResult, getFlightTimestamps } from './flighttime';

export interface AirframeData extends airframe {
  operator: airline | null;
}

export interface FlightData extends flight {
  user: user;
  departureAirport: airport;
  arrivalAirport: airport;
  airline: airline | null;
  aircraftType: aircraft_type | null;
  airframe: AirframeData | null;
}

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface RouteResult {
  airports: [airport, airport];
  frequency: number;
  inFuture: boolean;
}

export interface HeatmapResult extends LatLng {
  inFuture: boolean;
}

export interface FlightsResult extends Array<flight & Route> {}

export interface FlightTimeDataResult
  extends FlightData,
    FlightTimestampsResult {
  distance: number;
  flightNumberString: string;
  link: string;
}

export const getCenterpoint = (result?: FlightsResult): Coordinates => {
  const airports = Object.values(
    result?.reduce(
      (acc: Record<string, airport>, { departureAirport, arrivalAirport }) => ({
        ...acc,
        [departureAirport.id]: departureAirport,
        [arrivalAirport.id]: arrivalAirport,
      }),
      {},
    ) ?? {},
  );
  return airports.length > 0
    ? calculateCenterPoint(airports.map(({ lat, lon }) => ({ lat, lng: lon })))
    : {
        lat: 0,
        lng: 0,
      };
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
    inTime: flight.inTime,
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
    tailNumber: flight.airframe?.registration ?? flight.tailNumber,
    flightNumberString:
      flight.flightNumber !== null
        ? `${flight.airline?.iata ?? ''} ${flight.flightNumber}`.trim()
        : '',
    distance: Math.round(flightDistance),
    link: `/user/${flight.user.username}/flights/${flight.id}`,
  };
};
