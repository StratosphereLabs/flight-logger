import type { Airport, FlightRadarStatus } from '@prisma/client';
import type { FlightAwareTracklogItem } from '../../../../../app/data/flightAware/types';
import { type FlightsRouterOutput } from '../../../../../app/routes/flights';
import type { FlightDelayStatus } from '../../../../common/types';

export interface MapFlight extends google.maps.LatLngLiteral {
  heading: number;
  delayStatus: FlightDelayStatus;
  flightRadarStatus: FlightRadarStatus | null;
  callsign: string;
  tracklog: FlightAwareTracklogItem[] | undefined;
  waypoints: Array<[number, number]> | undefined;
}

export type RouteInput =
  FlightsRouterOutput['getUserMapData']['routes'][number] & {
    isSelected: boolean;
  };

export type AirportResult = Airport & {
  hasSelectedRoute: boolean;
};

export type FilteredMapData = Omit<
  FlightsRouterOutput['getUserMapData'],
  'heatmap' | 'routes' | 'airports'
> & {
  heatmap: google.maps.LatLngLiteral[];
  routes: RouteInput[];
  airports: AirportResult[];
};
