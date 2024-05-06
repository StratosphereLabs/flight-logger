import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { FlightsTable } from './FlightsTable';

export const UpcomingFlights = (): JSX.Element | null => {
  const { username } = useParams();
  const { data: userData } = useProfileUserQuery();
  const onError = useTRPCErrorHandler();
  const { data, isFetching } =
    trpc.flights.getUserUpcomingFlights.useInfiniteQuery(
      {
        limit: 5,
        username,
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
