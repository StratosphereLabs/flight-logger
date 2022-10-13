import { aircraft_type } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PaginationState, SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { REST_API_URL, HOUR } from '../constants';
import { PaginatedResults } from '../types';
import { getPaginationQueryString, getSortingQueryString } from '../utils';

export interface AircraftTypesQueryOptions {
  pagination: PaginationState;
  sorting: SortingState;
}

export const useAircraftTypesQuery = ({
  pagination,
  sorting,
}: AircraftTypesQueryOptions): UseQueryResult<PaginatedResults<aircraft_type> | null> =>
  useQuery(
    ['aircraftTypes', pagination, sorting],
    async () => {
      const queryString = [
        getPaginationQueryString(pagination),
        getSortingQueryString(sorting),
      ].join('&');
      const response = await axios.get<PaginatedResults<aircraft_type>>(
        `${REST_API_URL}/aircraft-types?${queryString}`,
      );
      return response?.data ?? null;
    },
    {
      cacheTime: 1 * HOUR,
      enabled:
        pagination.pageSize !== undefined && pagination.pageIndex !== undefined,
      staleTime: 1 * HOUR,
      keepPreviousData: true,
    },
  );
