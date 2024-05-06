import type { airport } from '@prisma/client';
import { type FlightsRouterOutput } from '../../../../../app/routes/flights';
import type { FlightDelayStatus } from '../../../../common/types';

export interface MapCoords {
  lat: number;
  lng: number;
}

export interface MapFlight extends MapCoords {
  heading: number;
  delayStatus: FlightDelayStatus;
}

export type RouteInput =
  FlightsRouterOutput['getUserMapData']['routes'][number] & {
    isHover: boolean;
    isSelected: boolean;
  };

export type AirportResult = airport & {
  hasSelectedRoute: boolean;
};

export type FilteredMapData = Omit<
  FlightsRouterOutput['getUserMapData'],
  'heatmap' | 'routes' | 'airports'
> & {
  heatmap: MapCoords[];
  routes: RouteInput[];
  airports: AirportResult[];
};
