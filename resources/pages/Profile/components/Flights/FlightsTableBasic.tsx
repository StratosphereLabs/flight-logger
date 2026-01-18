import { useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { type Control, useWatch } from 'react-hook-form';

import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { FlightsTable } from './FlightsTable';

export interface CompletedFlightsProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  selectedAirportId: string | null;
}

export const FlightsTableBasic = ({
  filtersFormControl,
  selectedAirportId,
}: CompletedFlightsProps): JSX.Element | null => {
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  const { data: userData } = useProfileUserQuery();
  const onError = useTRPCErrorHandler();
  const [status, range, year, month, fromDate, toDate, searchQuery] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate', 'searchQuery']
  >({
    control: filtersFormControl,
    name: [
      'status',
      'range',
      'year',
      'month',
      'fromDate',
      'toDate',
      'searchQuery',
    ],
  });
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
