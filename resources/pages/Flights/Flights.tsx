import { useEffect, useMemo, useState } from 'react';
import { Button, Progress } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
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
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { CreateTripModal } from './CreateTripModal';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { useFlightsPageStore } from './flightsPageStore';
import { ViewFlightModal } from './ViewFlightModal';
import { TripsPageNavigationState } from '../Trips';

interface FlightsData {
  flights: UsersRouterOutput['getUserFlights'];
  upcomingFlights: UsersRouterOutput['getUserFlights'];
}

export interface FlightsPageNavigationState {
  createTrip: boolean | undefined;
}

export const Flights = (): JSX.Element => {
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
  const { username } = useParams();
  const [isRowSelectEnabled, setIsRowSelectEnabled] = useState(false);
  const { rowSelection, resetRowSelection, setIsCreateTripDialogOpen } =
    useFlightsPageStore();
  useEffect(() => {
    if (state?.createTrip === true) {
      setIsRowSelectEnabled(true);
      window.history.replaceState({}, document.title);
    }
  }, [state?.createTrip]);
  const enableRowSelection = isRowSelectEnabled
    ? ({ original }: FlightsTableRow) => original.tripId === null
    : false;
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
              return acc;
            },
            {
              upcomingFlights: [],
              flights: [],
            },
          ),
        staleTime: 5 * 60 * 1000,
      },
    );
  useTRPCErrorHandler(error);
  const totalFlights = useMemo(
    () =>
      data !== undefined
        ? data.flights.length + data.upcomingFlights.length
        : 0,
    [data],
  );
  return (
    <div className="flex flex-col gap-4">
      <article className="prose self-center">
        <h2>
          {username !== undefined ? `${username}'s Flights` : 'My Flights'}
        </h2>
      </article>
      {totalFlights > 0 ? (
        <Form
          className="flex w-full flex-wrap justify-between gap-2"
          methods={methods}
        >
          <div className="flex gap-2">
            {username === undefined ? (
              <>
                <Button
                  color={isRowSelectEnabled ? 'error' : 'secondary'}
                  startIcon={
                    isRowSelectEnabled ? (
                      <CloseIcon className="h-4 w-4" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )
                  }
                  onClick={() =>
                    setIsRowSelectEnabled(isEnabled => {
                      if (isEnabled) resetRowSelection();
                      return !isEnabled;
                    })
                  }
                  size="sm"
                  type="button"
                >
                  {isRowSelectEnabled ? 'Cancel' : 'New Trip'}
                </Button>
                {isRowSelectEnabled ? (
                  <Button
                    color="primary"
                    disabled={Object.keys(rowSelection).length === 0}
                    onClick={() => setIsCreateTripDialogOpen(true)}
                    size="sm"
                    type="button"
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
      {isFetching ? <Progress /> : null}
      {!isFetching &&
      data !== undefined &&
      totalFlights > 0 &&
      layout === 'full' ? (
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
                data={data.upcomingFlights}
                enableRowSelection={enableRowSelection}
              />
            </Disclosure>
          ) : (
            <div className="my-6 flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Upcoming Flights</p>
              </div>
            </div>
          )}
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
                data={data.flights}
                enableRowSelection={enableRowSelection}
              />
            </Disclosure>
          ) : (
            <div className="my-6 flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Completed Flights</p>
              </div>
            </div>
          )}
        </>
      ) : null}
      {!isFetching &&
      data !== undefined &&
      layout === 'compact' &&
      totalFlights > 0 ? (
        <UserFlightsTable
          data={[...data.upcomingFlights, ...data.flights]}
          enableRowSelection={enableRowSelection}
        />
      ) : null}
      {!isFetching && data !== undefined && totalFlights === 0 ? (
        <div className="my-6 flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <p className="opacity-75">No Flights</p>
            <Button
              color="primary"
              onClick={() => navigate('/add-flight')}
              startIcon={<PlusIcon className="h-6 w-6" />}
            >
              Create Flight
            </Button>
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
