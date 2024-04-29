import { type InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type UsersRouterOutput } from '../../../../../app/routes/users';
import { FlightsTable } from './FlightsTable';

export interface CompletedFlightsProps {
  data?: InfiniteData<UsersRouterOutput['getUserCompletedFlights']>;
  isLoading: boolean;
}

export const CompletedFlights = ({
  data,
  isLoading,
}: CompletedFlightsProps): JSX.Element | null => {
  const flattenedData = useMemo(
    () => data?.pages.flatMap(({ results }) => results) ?? [],
    [data?.pages],
  );
  if (flattenedData.length === 0) return null;
  return (
    <FlightsTable
      count={data?.pages[0].count ?? 0}
      data={flattenedData}
      isLoading={isLoading}
      type="completed"
    />
  );
};
