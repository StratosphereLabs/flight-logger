import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  useCurrentUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { FlightsTable } from './FlightsTable';

export const CompletedFlights = (): JSX.Element | null => {
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data: userData } = useCurrentUserQuery();
  const { data, isLoading } =
    trpc.users.getUserCompletedFlights.useInfiniteQuery(
      {
        limit: 5,
        username,
      },
      {
        enabled: userData !== undefined,
        staleTime: 5 * 60 * 1000,
        onError,
      },
    );
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
