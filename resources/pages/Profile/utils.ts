import { type airport } from '@prisma/client';
import { type UsersRouterOutput } from '../../../app/routes/users';

export const getAirports = (
  result: UsersRouterOutput['getUserMapData']['routes'],
): airport[] => {
  const departureAirports =
    result?.map(({ departureAirport }) => departureAirport) ?? [];
  const arrivalAirports =
    result?.map(({ arrivalAirport }) => arrivalAirport) ?? [];
  const airportsMap = [...departureAirports, ...arrivalAirports].reduce<
    Record<string, airport>
  >(
    (acc, airport) => ({
      ...acc,
      [airport.id]: airport,
    }),
    {},
  );
  return Object.values(airportsMap);
};
