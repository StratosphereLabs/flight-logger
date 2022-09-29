import { aircraft_type } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL, HOUR } from '../constants';
import { PaginatedResults, PaginatedQueryOptions } from '../types';
import { getPaginationQueryString } from '../utils';

export const useAircraftTypesQuery = ({
  pageSize,
  pageIndex,
}: PaginatedQueryOptions): UseQueryResult<PaginatedResults<aircraft_type> | null> =>
  useQuery(
    ['aircraftTypes', pageSize, pageIndex],
    async () => {
      const response = await axios.get<PaginatedResults<aircraft_type>>(
        `${API_URL}/aircraft-types?${getPaginationQueryString({
          pageSize,
          pageIndex,
        })}`,
      );
      return response?.data ?? null;
    },
    {
      cacheTime: 1 * HOUR,
      enabled: pageSize !== undefined && pageIndex !== undefined,
      staleTime: 1 * HOUR,
    },
  );
