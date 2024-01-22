import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProfilePage } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { FlightsTable } from './FlightsTable';

export const UpcomingFlights = (): JSX.Element => {
  const enabled = useProfilePage();
  const { username } = useParams();
  const { data, isFetching } =
    trpc.users.getUserUpcomingFlights.useInfiniteQuery(
      {
        limit: 5,
        username,
      },
      { enabled, staleTime: 5 * 60 * 1000 },
    );
  const flattenedData = useMemo(
    () => data?.pages.flatMap(({ results }) => results) ?? [],
    [data?.pages],
  );
  return (
    <FlightsTable
      count={data?.pages[0].count ?? 0}
      data={flattenedData}
      isFetching={isFetching}
      title="Completed Flights"
    />
  );
};
