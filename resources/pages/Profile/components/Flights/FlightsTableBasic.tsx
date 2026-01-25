import { useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { useProfileFiltersFormData } from '../../../../layouts/ProfileLayout';
import { trpc } from '../../../../utils/trpc';
import { FlightsTable } from './FlightsTable';

export interface CompletedFlightsProps {
  selectedAirportId: string | null;
}

export const FlightsTableBasic = ({
  selectedAirportId,
}: CompletedFlightsProps): JSX.Element | null => {
  const { username } = useParams({ strict: false });
  const { data: userData } = useProfileUserQuery();
  const onError = useTRPCErrorHandler();
  const { status, range, year, month, fromDate, toDate, searchQuery } =
    useProfileFiltersFormData();
  const { data, isFetching } =
    trpc.flights.getUserFlightsBasic.useInfiniteQuery(
      {
        limit: 5,
        username,
        status,
        selectedAirportId,
        range,
        year,
        month,
        fromDate,
        toDate,
        searchQuery,
      },
      {
        enabled: userData !== undefined,
        onError,
      },
    );
  const flattenedData = useMemo(
    () => data?.pages.flatMap(({ results }) => results) ?? [],
    [data?.pages],
  );
  return <FlightsTable data={flattenedData} isLoading={isFetching} />;
};
