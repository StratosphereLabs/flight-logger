import { type Dispatch, type SetStateAction, useEffect } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'stratosphere-ui';
import { PlusIcon, UserFlightsTable } from '../../common/components';
import { APP_URL } from '../../common/constants';
import {
  useCopyToClipboard,
  useProfilePage,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { type ProfileFilterFormData } from '../Profile/hooks';
import { type TripsPageNavigationState } from '../Trips';
import { CreateTripModal } from './CreateTripModal';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { useFlightsPageStore } from './flightsPageStore';
import { ViewFlightModal } from './ViewFlightModal';

export interface FlightsPageNavigationState {
  createTrip: boolean | undefined;
  defaultOpen?: 'upcoming' | 'completed';
}

export interface FlightsFormData {
  layout: 'full' | 'compact';
}

export interface FlightsProps {
  filtersFormControl: Control<ProfileFilterFormData>;
  isRowSelectEnabled: boolean;
  setIsRowSelectEnabled: Dispatch<SetStateAction<boolean>>;
}

export const Flights = ({
  filtersFormControl,
  isRowSelectEnabled,
  setIsRowSelectEnabled,
}: FlightsProps): JSX.Element => {
  const enabled = useProfilePage();
  const copyToClipboard = useCopyToClipboard();
  const { state } = useLocation() as {
    state: FlightsPageNavigationState | null;
  };
  const navigate = useNavigate();
  const { flightId, username } = useParams();
  const { setActiveFlight, resetRowSelection, setIsViewDialogOpen } =
    useFlightsPageStore();
  useEffect(() => {
    if (state?.createTrip === true) {
      setIsRowSelectEnabled(true);
      window.history.replaceState({}, document.title);
    }
  }, [setIsRowSelectEnabled, state?.createTrip]);
  const onError = useTRPCErrorHandler();
  const [status, range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['status', 'range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { data, isLoading, refetch } = trpc.flights.getUserFlights.useQuery(
    {
      username,
      withTrip: !isRowSelectEnabled,
      status,
      range,
      year,
      month,
      fromDate,
      toDate,
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  useEffect(() => {
    if (data !== undefined && flightId !== undefined) {
      const flight = data.flights.find(({ id }) => flightId === id) ?? null;
      setActiveFlight(flight);
      setIsViewDialogOpen(true);
    }
  }, [data, flightId, setActiveFlight, setIsViewDialogOpen]);
  return (
    <div className="flex flex-1 flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-1 justify-center pt-8">
          <span className="loading loading-spinner" />
        </div>
      ) : null}
      {!isLoading && data !== undefined && data.total > 0 ? (
        <UserFlightsTable
          className="table-xs shadow-sm sm:table-sm"
          data={data.flights}
          dateBadgeColor={({ outDateISO }) =>
            outDateISO.split('-')[0] === new Date().getFullYear().toString()
              ? 'info'
              : 'secondary'
          }
          enableRowSelection={isRowSelectEnabled}
          onCopyLink={({ link }) => {
            copyToClipboard(`${APP_URL}${link}`, 'Link copied to clipboard!');
          }}
        />
      ) : null}
      {!isLoading && data?.total === 0 ? (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Flights</p>
            {username === undefined ? (
              <Button
                color="primary"
                onClick={() => {
                  navigate('/add-flight');
                }}
              >
                <PlusIcon className="h-6 w-6" />
                Create Flight
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <DeleteFlightModal isRowSelectEnabled={isRowSelectEnabled} />
      <EditFlightModal onSuccess={async () => await refetch()} />
      <ViewFlightModal />
      <CreateTripModal
        onSuccess={tripId => {
          setIsRowSelectEnabled(false);
          resetRowSelection();
          navigate('/trips', {
            state: { tripId } as const as TripsPageNavigationState,
          });
        }}
      />
    </div>
  );
};
