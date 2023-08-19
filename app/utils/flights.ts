import {
  type aircraft_type,
  type airframe,
  type airline,
  type airport,
  type flight,
} from '@prisma/client';
import { type LatLng } from '../types';
import { calculateCenterPoint, type Coordinates } from './coordinates';
import { getInFuture } from './datetime';
import { calculateDistance } from './distance';
import { type FlightTimestampsResult, getFlightTimestamps } from './flighttime';

export interface AirframeData extends airframe {
  operator: airline | null;
}

export interface FlightData extends flight {
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

export interface RouteResult extends Route {
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

export const getRoutes = (result?: FlightsResult): RouteResult[] =>
  result?.map(
    ({ outTime, departureAirport, arrivalAirport }) => ({
      inFuture: getInFuture(outTime),
      departureAirport,
      arrivalAirport,
    }),
    [],
  ) ?? [];

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
  };
};
