import type { airport } from '@prisma/client';
import type { UsersRouterOutput } from '../../../../../app/routes/users';
import type { FlightDelayStatus } from '../../types';

export interface MapCoords {
  lat: number;
  lng: number;
}

export interface MapFlight extends MapCoords {
  heading: number;
  delayStatus: FlightDelayStatus;
}

export type RouteInput =
  UsersRouterOutput['getUserMapData']['routes'][number] & {
    isHover: boolean;
    isSelected: boolean;
  };

export type AirportResult = airport & {
  hasSelectedRoute: boolean;
};

export type FilteredMapData = Omit<
  UsersRouterOutput['getUserMapData'],
  'heatmap' | 'routes' | 'airports'
> & {
  heatmap: MapCoords[];
  routes: RouteInput[];
  airports: AirportResult[];
};
