import { aircraft_type, airline } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL, HOUR } from '../constants';

export const useAircraftTypesSearchQuery = (
  query: string,
): UseQueryResult<aircraft_type[]> =>
  useQuery(
    ['aircraftTypes', query],
    async () => {
      const response = await axios.get<airline[]>(
        `${API_URL}/aircraft-types/search/${encodeURIComponent(query)}`,
      );
      return response.data;
    },
    {
      cacheTime: 1 * HOUR,
      enabled: query.length > 0,
      staleTime: 1 * HOUR,
    },
  );
