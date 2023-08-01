import { type airport } from '@prisma/client';
import { type UsersRouterOutput } from '../../../app/routes/users';

export type RouteInput =
  UsersRouterOutput['getUserMapData']['routes'][number] & {
    isHover: boolean;
    isSelected: boolean;
  };

export type AirportResult = airport & {
  hasSelectedRoute: boolean;
};

export const getAirports = (result: RouteInput[]): AirportResult[] => {
  const departureAirports =
    result?.map(({ departureAirport }) => departureAirport) ?? [];
  const arrivalAirports =
    result?.map(({ arrivalAirport }) => arrivalAirport) ?? [];
  const selectedAirportIds = [
    ...new Set(
      result?.flatMap(({ isSelected, departureAirport, arrivalAirport }) =>
        isSelected ? [departureAirport.id, arrivalAirport.id] : [],
      ),
    ),
  ];
  const airportsMap = [...departureAirports, ...arrivalAirports].reduce<
    Record<string, AirportResult>
  >(
    (acc, airport) => ({
      ...acc,
      [airport.id]: {
        ...airport,
        hasSelectedRoute: selectedAirportIds.includes(airport.id),
      },
    }),
    {},
  );
  return Object.values(airportsMap);
};
