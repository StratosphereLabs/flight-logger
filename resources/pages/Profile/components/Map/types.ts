import type { Airport } from '@prisma/client';

import type { TracklogItem } from '../../../../../app/data/types';
import { type FlightsRouterOutput } from '../../../../../app/routes/flights';
import { type TransformFlightDataResult } from '../../../../../app/utils';
import type { FlightDelayStatus } from '../../../../common/types';

export interface MapFlight extends google.maps.LatLngLiteral {
  heading: number;
  delayStatus: FlightDelayStatus;
  flightStatus: TransformFlightDataResult['flightStatus'];
  callsign: string;
  tracklog: TracklogItem[] | undefined;
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
