import { useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { Button, Loading, useDebouncedValue } from 'stratosphere-ui';

import { PlusIcon, UserFlightsTable } from '../../common/components';
import { APP_URL } from '../../common/constants';
import {
  useCopyToClipboard,
  useLoggedInUserQuery,
  useProfilePage,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { useProfileFiltersFormData } from '../../layouts/ProfileLayout';
import { trpc } from '../../utils/trpc';
import { useAddFlightStore } from '../Profile/components/Flights/addFlightStore';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { FETCH_FLIGHTS_PAGE_SIZE } from './constants';

export interface FlightsPageNavigationState {
  defaultOpen?: 'upcoming' | 'completed';
}

export interface FlightsFormData {
  layout: 'full' | 'compact';
}

export interface FlightsProps {
  selectedAirportId: string | null;
}

export const Flights = ({ selectedAirportId }: FlightsProps): JSX.Element => {
  const enabled = useProfilePage();
  const copyToClipboard = useCopyToClipboard();
  // const { state } = useLocation();
  const { username } = useParams({ strict: false });
  const { setIsAddingFlight } = useAddFlightStore();
  const { onOwnProfile } = useLoggedInUserQuery();

  const onError = useTRPCErrorHandler();
  const { status, range, year, month, fromDate, toDate, searchQuery } =
    useProfileFiltersFormData();
  const { debouncedValue } = useDebouncedValue(searchQuery, 400);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = trpc.flights.getUserFlights.useInfiniteQuery(
    {
      username,
      selectedAirportId,
      status,
      range,
      year,
      month,
      fromDate,
      toDate,
      searchQuery: debouncedValue,
      limit: FETCH_FLIGHTS_PAGE_SIZE,
    },
    {
      enabled,
      getNextPageParam: ({ metadata }) =>
        metadata.page < metadata.pageCount ? metadata.page + 1 : undefined,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  const { ref } = useInView({
    skip: isFetching || hasNextPage !== true,
    delay: 0,
    onChange: async inView => {
      if (inView) {
        await fetchNextPage();
      }
    },
  });
  return (
    <div className="flex flex-1 flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-1 justify-center py-6">
          <span className="loading loading-spinner" />
        </div>
      ) : null}
      {!isLoading &&
      data !== undefined &&
      data.pages[0].metadata.itemCount > 0 ? (
        <>
          <UserFlightsTable
            className="shadow-xs"
            data={data.pages.flatMap(({ results }) => results)}
            dateBadgeColor={({ outDateISO }) =>
              outDateISO.split('-')[0] === new Date().getFullYear().toString()
                ? 'info'
                : 'secondary'
            }
            onCopyLink={({ link }) => {
              copyToClipboard(`${APP_URL}${link}`, 'Link copied to clipboard!');
            }}
            size="xs"
          />
          <div
            ref={ref}
            className={classNames(
              'h-[20px] w-full justify-center',
              hasNextPage === true ? 'flex' : 'hidden',
            )}
          >
            {isFetchingNextPage ? (
              <div className="flex gap-2 text-sm opacity-90">
                <Loading size="xs" />
                <span>Loading</span>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
      {!isLoading && data?.pages[0].metadata.itemCount === 0 ? (
        <div className="my-6 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Flights</p>
            {onOwnProfile ? (
              <Button
                color="primary"
                onClick={() => {
                  setIsAddingFlight(true);
                }}
                soft
              >
                <PlusIcon className="h-6 w-6" />
                Create Flight
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <DeleteFlightModal />
      <EditFlightModal onSuccess={async () => await refetch()} />
    </div>
  );
};
