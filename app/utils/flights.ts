import { airport, flight } from '@prisma/client';

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface FlightsResult extends Array<flight & Route> {}

export const getAirports = (result?: FlightsResult): airport[] => {
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

export const getRoutes = (result?: FlightsResult): Route[] =>
  result?.reduce((acc: Route[], flight) => {
    const { departureAirport, arrivalAirport } = flight;
    if (
      acc.find(
        route =>
          (route.departureAirport.id === departureAirport.id &&
            route.arrivalAirport.id === arrivalAirport.id) ||
          (route.departureAirport.id === arrivalAirport.id &&
            route.arrivalAirport.id === departureAirport.id),
      ) !== undefined
    ) {
      return acc;
    }
    return [
      ...acc,
      {
        departureAirport,
        arrivalAirport,
      },
    ];
  }, []) ?? [];
