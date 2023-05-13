import { airport, flight } from '@prisma/client';
import { getInFuture } from './datetime';
import { LatLng } from '../types';

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface HeatmapResult extends LatLng {
  inFuture: boolean;
}

export interface FlightsResult extends Array<flight & Route> {}

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
