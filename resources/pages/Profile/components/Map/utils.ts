import type { Airport } from '@prisma/client';
import { type FlightsRouterOutput } from '../../../../../app/routes/flights';
import type { AirportResult } from './types';

export const getAirportsData = (
  routes: Array<[Airport, Airport]>,
  selectedAirportId: string | null,
  selectedFlight?: FlightsRouterOutput['getFollowingFlights']['flights'][number],
): AirportResult[] => {
  const selectedAirportIds = new Set<string>();
  for (const [departureAirport, arrivalAirport] of routes) {
    const isSelected =
      selectedAirportId !== null
        ? [departureAirport.id, arrivalAirport.id].includes(selectedAirportId)
        : selectedFlight !== undefined
          ? selectedFlight.departureAirportId === departureAirport.id &&
            selectedFlight.arrivalAirportId === arrivalAirport.id
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
