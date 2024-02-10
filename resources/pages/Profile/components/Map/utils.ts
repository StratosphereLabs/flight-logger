import type { AirportResult, RouteInput } from './types';

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
