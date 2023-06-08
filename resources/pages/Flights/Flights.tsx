import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  CloseIcon,
  Disclosure,
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
} from 'stratosphere-ui';
import { UsersRouterOutput } from '../../../app/routes/users';
import {
  Bars2Icon,
  Bars4Icon,
  FlightsTableRow,
  PlusIcon,
  UserFlightsTable,
} from '../../common/components';
import {
  useCopyToClipboard,
  useProfileLink,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { TripsPageNavigationState } from '../Trips';
import { CreateTripModal } from './CreateTripModal';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { useFlightsPageStore } from './flightsPageStore';
import { ViewFlightModal } from './ViewFlightModal';

export interface FlightsData {
  flights: UsersRouterOutput['getUserFlights'];
  upcomingFlights: UsersRouterOutput['getUserFlights'];
  total: number;
}

export interface FlightsPageNavigationState {
  createTrip: boolean | undefined;
}

export const Flights = (): JSX.Element => {
  const copyToClipboard = useCopyToClipboard();
  const { state } = useLocation() as {
    state: FlightsPageNavigationState | null;
  };
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      layout: 'full',
    },
  });
  const layout = methods.watch('layout');
  const { flightId, username } = useParams();
  const [isRowSelectEnabled, setIsRowSelectEnabled] = useState(false);
  const {
    setActiveFlight,
    rowSelection,
    resetRowSelection,
    setIsCreateTripDialogOpen,
    setIsViewDialogOpen,
  } = useFlightsPageStore();
  useEffect(() => {
    if (state?.createTrip === true) {
      setIsRowSelectEnabled(true);
      window.history.replaceState({}, document.title);
    }
  }, [state?.createTrip]);
  const enableRowSelection = isRowSelectEnabled
    ? ({ original }: FlightsTableRow) => original.tripId === null
    : false;
  const flightsLink = useProfileLink('flights');
  const { data, error, isFetching, refetch } =
    trpc.users.getUserFlights.useQuery(
      {
        username,
        withTrip: !isRowSelectEnabled,
      },
      {
        select: flights =>
          flights.reduce(
            (acc: FlightsData, flight) => {
              if (flight.inFuture) acc.upcomingFlights.push(flight);
              else acc.flights.push(flight);
              acc.total++;
              return acc;
            },
            {
              upcomingFlights: [],
              flights: [],
              total: 0,
            },
          ),
        staleTime: 5 * 60 * 1000,
      },
    );
  useEffect(() => {
    if (data !== undefined && flightId !== undefined) {
      const flight =
        data.upcomingFlights.find(({ id }) => flightId === id) ??
        data.flights.find(({ id }) => flightId === id) ??
        null;
      setActiveFlight(flight);
      setIsViewDialogOpen(true);
    }
  }, [data, flightId]);
  useTRPCErrorHandler(error);
  return (
    <div className="flex flex-col gap-4">
      <article className="prose self-center">
        <h2>
          {username !== undefined ? `${username}'s Flights` : 'My Flights'}
        </h2>
      </article>
      {data !== undefined && data.total > 0 ? (
        <Form
          className="flex w-full flex-wrap justify-between gap-2"
          methods={methods}
        >
          <div className="flex gap-2">
            {username === undefined ? (
              <>
                <Button
                  color={isRowSelectEnabled ? 'error' : 'secondary'}
                  onClick={() =>
                    setIsRowSelectEnabled(isEnabled => {
                      if (isEnabled) resetRowSelection();
                      return !isEnabled;
                    })
                  }
                  size="sm"
                >
                  {isRowSelectEnabled ? (
                    <CloseIcon className="h-4 w-4" />
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                  {isRowSelectEnabled ? 'Cancel' : 'New Trip'}
                </Button>
                {isRowSelectEnabled ? (
                  <Button
                    color="primary"
                    disabled={Object.keys(rowSelection).length === 0}
                    onClick={() => setIsCreateTripDialogOpen(true)}
                    size="sm"
                  >
                    Create ({Object.keys(rowSelection).length})
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
          <FormRadioGroup name="layout">
            <FormRadioGroupOption size="sm" value="full">
              <Bars2Icon className="h-4 w-4" />
              <span className="sr-only">Full</span>
            </FormRadioGroupOption>
            <FormRadioGroupOption size="sm" value="compact">
              <Bars4Icon className="h-4 w-4" />
              <span className="sr-only">Compact</span>
            </FormRadioGroupOption>
          </FormRadioGroup>
        </Form>
      ) : null}
      {isFetching ? (
        <div className="flex flex-1 justify-center pt-8">
          <span className="loading loading-spinner" />
        </div>
      ) : null}
      {layout === 'full' && data !== undefined && data.total > 0 ? (
        <>
          {data.upcomingFlights.length > 0 ? (
            <Disclosure
              buttonProps={{
                children: (
                  <span>
                    Upcoming Flights{' '}
                    {!isRowSelectEnabled
                      ? `(${data.upcomingFlights.length})`
                      : ''}
                  </span>
                ),
                color: 'ghost',
                size: 'lg',
              }}
              defaultOpen={isRowSelectEnabled}
              rounded
            >
              <UserFlightsTable
                className="table-sm xl:table-md"
                data={data.upcomingFlights}
                enableRowSelection={enableRowSelection}
                onCopyLink={({ id }) =>
                  copyToClipboard(
                    `${flightsLink}/${id}`,
                    'Link copied to clipboard!',
                  )
                }
              />
            </Disclosure>
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Upcoming Flights</p>
              </div>
            </div>
          )}
          <div className="divider" />
          {data.flights.length > 0 ? (
            <Disclosure
              buttonProps={{
                children: (
                  <span>
                    Completed Flights{' '}
                    {!isRowSelectEnabled ? `(${data.flights.length})` : ''}
                  </span>
                ),
                color: 'ghost',
                size: 'lg',
              }}
              defaultOpen
              rounded
            >
              <UserFlightsTable
                className="table-sm xl:table-md"
                data={data.flights}
                enableRowSelection={enableRowSelection}
                onCopyLink={({ id }) =>
                  copyToClipboard(
                    `${flightsLink}/${id}`,
                    'Link copied to clipboard!',
                  )
                }
              />
            </Disclosure>
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Completed Flights</p>
              </div>
            </div>
          )}
        </>
      ) : null}
      {layout === 'compact' && data !== undefined && data.total > 0 ? (
        <UserFlightsTable
          className="table-sm xl:table-md"
          data={[...data.upcomingFlights, ...data.flights]}
          enableRowSelection={enableRowSelection}
          onCopyLink={({ id }) =>
            copyToClipboard(`${flightsLink}/${id}`, 'Link copied to clipboard!')
          }
        />
      ) : null}
      {data?.total === 0 ? (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Flights</p>
            {username === undefined ? (
              <Button color="primary" onClick={() => navigate('/add-flight')}>
                <PlusIcon className="h-6 w-6" />
                Create Flight
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <DeleteFlightModal />
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
