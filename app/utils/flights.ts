import { aircraft_type, airline, airport, flight } from '@prisma/client';
import { getInFuture } from './datetime';
import { calculateDistance } from './distance';
import { FlightTimestampsResult, getFlightTimestamps } from './flighttime';
import { LatLng } from '../types';

export interface FlightData extends flight {
  departureAirport: airport;
  arrivalAirport: airport;
  airline: airline | null;
  aircraftType: aircraft_type | null;
}

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
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

export const getAirports = (result?: FlightsResult): airport[] => {
  const departureAirports =
    result?.map(({ departureAirport }) => departureAirport) ?? [];
  const arrivalAirports =
    result?.map(({ arrivalAirport }) => arrivalAirport) ?? [];
  const airportsMap = [...departureAirports, ...arrivalAirports].reduce<
    Record<string, airport>
  >(
    (acc, airport) => ({
      ...acc,
      [airport.id]: airport,
    }),
    {},
  );
  return Object.values(airportsMap);
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

export const getRoutes = (result?: FlightsResult): Route[] =>
  result?.reduce((acc: Route[], flight) => {
    const { departureAirport, arrivalAirport } = flight;
    if (
      acc.find(
        route =>
          (route.departureAirport.id === departureAirport.id &&
            route.arrivalAirport.id === arrivalAirport.id) ||
          (route.departureAirport.id === arrivalAirport.id &&
            route.arrivalAirport.id === departureAirport.id),
      ) !== undefined
    ) {
      return acc;
    }
    return [
      ...acc,
      {
        departureAirport,
        arrivalAirport,
      },
    ];
  }, []) ?? [];

export const getFlightTimeData = (
  flights: FlightData[],
): FlightTimeDataResult[] =>
  flights.map(flight => {
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
      flightNumberString:
        flight.flightNumber !== null
          ? `${flight.airline?.iata ?? ''} ${flight.flightNumber}`.trim()
          : '',
      distance: Math.round(flightDistance),
    };
  });
