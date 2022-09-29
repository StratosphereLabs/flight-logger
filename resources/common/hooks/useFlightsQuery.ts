import { aircraft_type, airline, airport, flight } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';
import { useAppContext } from '../../context';
import { API_URL, MINUTE } from '../constants';

export interface FlightResponse extends flight {
  [key: string]: unknown;
  departureAirport: airport;
  arrivalAirport: airport;
  airline: airline;
  aircraftType: aircraft_type;
}

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface UseFlightQueryResult {
  airportsList: airport[];
  routesList: Route[];
}

export const useFlightsQuery = (): UseQueryResult<FlightResponse[]> &
  UseFlightQueryResult => {
  const { user } = useAppContext();
  const queryResult = useQuery(
    [user?.username, 'flights'],
    async (): Promise<FlightResponse[]> => {
      const response = await axios.get<FlightResponse[]>(
        `${API_URL}/users/${user?.username ?? ''}/flights`,
      );
      return response?.data ?? [];
    },
    {
      cacheTime: 5 * MINUTE,
      enabled: user?.username !== undefined,
      staleTime: 5 * MINUTE,
    },
  );
  const airportsList = useMemo<airport[]>(() => {
    const departureAirports =
      queryResult?.data?.map(({ departureAirport }) => departureAirport) ?? [];
    const arrivalAirports =
      queryResult?.data?.map(({ arrivalAirport }) => arrivalAirport) ?? [];
    const airportsMap = [...departureAirports, ...arrivalAirports].reduce(
      (acc, airport) => ({
        ...acc,
        [airport.id]: airport,
      }),
      {},
    );
    return Object.values(airportsMap);
  }, [queryResult?.data]);
  const routesList = useMemo<Route[]>(
    () =>
      queryResult?.data?.reduce((acc: Route[], flight) => {
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
      }, []) ?? [],
    [queryResult?.data],
  );
  return {
    ...queryResult,
    airportsList,
    routesList,
  };
};
