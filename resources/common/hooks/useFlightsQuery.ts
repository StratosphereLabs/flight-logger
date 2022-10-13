import { aircraft_type, airline, airport, flight } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { useAppContext } from '../../context';
import { REST_API_URL, MINUTE } from '../constants';

export interface FlightsResponse extends flight {
  [key: string]: unknown;
  departureAirport: airport;
  arrivalAirport: airport;
  airline: airline;
  aircraftType: aircraft_type;
}

export const useFlightsQuery = (): UseQueryResult<FlightsResponse[]> => {
  const { user } = useAppContext();
  return useQuery(
    [user?.username, 'flights'],
    async () => {
      const response = await axios.get<FlightsResponse[]>(
        `${REST_API_URL}/users/${user?.username ?? ''}/flights`,
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
