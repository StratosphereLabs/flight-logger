import { useMemo } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { FlightsTable } from './FlightsTable';
import { type ProfileFilterFormData } from '../../hooks';

export interface CompletedFlightsProps {
  filtersFormControl: Control<ProfileFilterFormData>;
}

export const FlightsTableBasic = ({
  filtersFormControl,
}: CompletedFlightsProps): JSX.Element | null => {
  const { username } = useParams();
  const { data: userData } = useProfileUserQuery();
  const onError = useTRPCErrorHandler();
  const [status, range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['status', 'range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { data, isFetching } =
    trpc.flights.getUserFlightsBasic.useInfiniteQuery(
      {
        limit: 5,
        username,
        status,
        range,
        year,
        month,
        fromDate,
        toDate,
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