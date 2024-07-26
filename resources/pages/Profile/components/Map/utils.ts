import type { airport } from '@prisma/client';
import type { AirportResult } from './types';

export const getAirportsData = (
  routes: Array<[airport, airport]>,
  selectedAirportId: string | null,
): AirportResult[] => {
  const selectedAirportIds = new Set<string>();
  for (const [departureAirport, arrivalAirport] of routes) {
    const isSelected =
      selectedAirportId !== null
        ? [departureAirport.id, arrivalAirport.id].includes(selectedAirportId)
        : false;
    if (isSelected) {
      selectedAirportIds.add(departureAirport.id);
      selectedAirportIds.add(arrivalAirport.id);
    }
  }
  const airportsMap: Record<string, AirportResult> = {};
  for (const [departureAirport, arrivalAirport] of routes) {
    airportsMap[departureAirport.id] = {
      ...departureAirport,
      hasSelectedRoute: selectedAirportIds.has(departureAirport.id),
    };
    airportsMap[arrivalAirport.id] = {
      ...arrivalAirport,
      hasSelectedRoute: selectedAirportIds.has(arrivalAirport.id),
    };
  }
  return Object.values(airportsMap);
};
