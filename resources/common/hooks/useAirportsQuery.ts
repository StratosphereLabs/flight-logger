import { airport } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PaginationState, SortingState } from '@tanstack/react-table';
import axios from 'axios';
import { API_URL, HOUR } from '../constants';
import { PaginatedResults } from '../types';
import { getPaginationQueryString, getSortingQueryString } from '../utils';

export interface AirportsQueryOptions {
  pagination: PaginationState;
  sorting: SortingState;
}

export const useAirportsQuery = ({
  pagination,
  sorting,
}: AirportsQueryOptions): UseQueryResult<PaginatedResults<airport> | null> =>
  useQuery(
    ['airports', pagination, sorting],
    async () => {
      const queryString = [
        getPaginationQueryString(pagination),
        getSortingQueryString(sorting),
      ].join('&');
      const response = await axios.get<PaginatedResults<airport>>(
        `${API_URL}/airports?${queryString}`,
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
