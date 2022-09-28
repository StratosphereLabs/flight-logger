import { aircraft_type } from '@prisma/client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants';
import { PaginatedResults, PaginationQueryOptions } from '../types';

export const useAircraftTypesQuery = ({
  page,
  limit,
}: PaginationQueryOptions): UseQueryResult<PaginatedResults<aircraft_type>> =>
  useQuery(['aircraftTypes'], async (): Promise<aircraft_type[]> => {
    const response = await axios.get<PaginatedResults<aircraft_type>>(
      `${API_URL}/aircraft-types?page=${page}&limit=${limit}`,
    );
    return response?.data?.results ?? [];
  });
