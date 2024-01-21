import { type airport } from '@prisma/client';
import { type UsersRouterOutput } from '../../../app/routes/users';

export interface MapCoords {
  lat: number;
  lng: number;
}

export type FlightDelayStatus = 'severe' | 'moderate' | 'none';

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

export const getAirports = (result: RouteInput[]): AirportResult[] => {
  const selectedAirportIds = [
    ...new Set(
      result?.flatMap(({ isSelected, airports }) =>
        isSelected ? airports.map(({ id }) => id) : [],
      ),
    ),
  ];
  const airportsMap = result.reduce<Record<string, AirportResult>>(
    (acc, airport) => ({
      ...acc,
      [airport.airports[0].id]: {
        ...airport.airports[0],
        hasSelectedRoute: selectedAirportIds.includes(airport.airports[0].id),
      },
      [airport.airports[1].id]: {
        ...airport.airports[1],
        hasSelectedRoute: selectedAirportIds.includes(airport.airports[1].id),
      },
    }),
    {},
  );
  return Object.values(airportsMap);
};
