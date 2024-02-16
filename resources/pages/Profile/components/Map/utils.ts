import type { AirportResult, RouteInput } from './types';

export const getAirports = (result: RouteInput[]): AirportResult[] => {
  const selectedAirportIds = new Set<string>();
  for (const { isSelected, airports } of result) {
    if (isSelected) {
      selectedAirportIds.add(airports[0].id);
      selectedAirportIds.add(airports[1].id);
    }
  }
  const airportsMap: Record<string, AirportResult> = {};
  for (const { airports } of result) {
    const airport1 = airports[0];
    const airport2 = airports[1];
    airportsMap[airport1.id] = {
      ...airport1,
      hasSelectedRoute: selectedAirportIds.has(airport1.id),
    };
    airportsMap[airport2.id] = {
      ...airport2,
      hasSelectedRoute: selectedAirportIds.has(airport2.id),
    };
  }
  return Object.values(airportsMap);
};
