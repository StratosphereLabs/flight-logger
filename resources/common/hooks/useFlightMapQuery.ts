import { airport } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { useAppContext } from '../../context';
import { API_URL, MINUTE } from '../constants';

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface FlightMapResponse {
  airports: airport[];
  routes: Route[];
}

export const useFlightMapQuery = (): UseQueryResult<FlightMapResponse> => {
  const { user } = useAppContext();
  return useQuery(
    [user?.username, 'flightMap'],
    async () => {
      const response = await axios.get<FlightMapResponse>(
        `${API_URL}/users/${user?.username ?? ''}/flight-map`,
      );
      return response?.data ?? [];
    },
    {
      cacheTime: 5 * MINUTE,
      enabled: user?.username !== undefined,
      staleTime: 5 * MINUTE,
    },
  );
};
