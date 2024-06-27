import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  CloseIcon,
  Disclosure,
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
} from 'stratosphere-ui';
import {
  Bars2Icon,
  Bars4Icon,
  type FlightsTableRow,
  PlusIcon,
  UserFlightsTable,
} from '../../common/components';
import { APP_URL } from '../../common/constants';
import {
  useCopyToClipboard,
  useProfilePage,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
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

export const Flights = (): JSX.Element => {
  const enabled = useProfilePage();
  const copyToClipboard = useCopyToClipboard();
  const { state } = useLocation() as {
    state: FlightsPageNavigationState | null;
  };
  const navigate = useNavigate();
  const methods = useForm<FlightsFormData>({
    defaultValues: {
      layout: 'full',
    },
  });
  const layout = useWatch<FlightsFormData, 'layout'>({
    control: methods.control,
    name: 'layout',
  });
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
  const onError = useTRPCErrorHandler();
  const { data, isLoading, refetch } = trpc.flights.getUserFlights.useQuery(
    {
      username,
      withTrip: !isRowSelectEnabled,
      layout,
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  useEffect(() => {
    if (data !== undefined && flightId !== undefined) {
      const flight =
        data.upcomingFlights.find(({ id }) => flightId === id) ??
        data.currentFlights.find(({ id }) => flightId === id) ??
        data.completedFlights.find(({ id }) => flightId === id) ??
        null;
      setActiveFlight(flight);
      setIsViewDialogOpen(true);
    }
  }, [data, flightId, setActiveFlight, setIsViewDialogOpen]);
  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-3">
      <article className="prose self-center">
        <h2>
          {username !== undefined ? `${username}'s Flights` : 'My Flights'}
        </h2>
      </article>
      <Form
        className="flex w-full flex-wrap justify-between gap-2"
        methods={methods}
      >
        <div className="flex gap-2">
          {username === undefined ? (
            <>
              <Button
                color={isRowSelectEnabled ? 'error' : 'secondary'}
                onClick={() => {
                  setIsRowSelectEnabled(isEnabled => {
                    if (isEnabled) resetRowSelection();
                    return !isEnabled;
                  });
                }}
                outline
                size="sm"
              >
                {isRowSelectEnabled ? (
                  <CloseIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                {isRowSelectEnabled ? 'Cancel' : 'Add Trip'}
              </Button>
              {!isRowSelectEnabled ? (
                <Button
                  color="primary"
                  onClick={() => {
                    navigate('/add-flight');
                  }}
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Flight
                </Button>
              ) : null}
              {isRowSelectEnabled ? (
                <Button
                  color="primary"
                  disabled={Object.keys(rowSelection).length === 0}
                  onClick={() => {
                    setIsCreateTripDialogOpen(true);
                  }}
                  size="sm"
                >
                  Create ({Object.keys(rowSelection).length})
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
        <FormRadioGroup name="layout">
          <FormRadioGroupOption activeColor="info" size="sm" value="full">
            <Bars2Icon className="h-4 w-4" />
            <span className="sr-only">Full</span>
          </FormRadioGroupOption>
          <FormRadioGroupOption activeColor="info" size="sm" value="compact">
            <Bars4Icon className="h-4 w-4" />
            <span className="sr-only">Compact</span>
          </FormRadioGroupOption>
        </FormRadioGroup>
      </Form>
      {isLoading ? (
        <div className="flex flex-1 justify-center pt-8">
          <span className="loading loading-spinner" />
        </div>
      ) : null}
      {layout === 'full' &&
      !isLoading &&
      data !== undefined &&
      data.total > 0 ? (
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
              className="bg-base-100"
              defaultOpen={
                state?.defaultOpen === 'upcoming' || isRowSelectEnabled
              }
              rounded
            >
              <UserFlightsTable
                className="table-sm xl:table-md"
                data={data.upcomingFlights}
                dateBadgeColor="secondary"
                enableRowSelection={enableRowSelection}
                onCopyLink={({ link }) => {
                  copyToClipboard(
                    `${APP_URL}${link}`,
                    'Link copied to clipboard!',
                  );
                }}
              />
            </Disclosure>
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-8">
                <p className="opacity-75">No Upcoming Flights</p>
              </div>
            </div>
          )}
          <div className="divider my-2" />
          {data.currentFlights.length > 0 ? (
            <>
              <Disclosure
                buttonProps={{
                  children: <span>Current Flight</span>,
                  color: 'ghost',
                  size: 'lg',
                }}
                className="bg-base-100"
                defaultOpen={
                  isRowSelectEnabled || data.currentFlights.length > 0
                }
                rounded
              >
                <UserFlightsTable
                  className="table-sm border-separate xl:table-md"
                  data={data.currentFlights}
                  dateBadgeColor="accent"
                  enableRowSelection={enableRowSelection}
                  onCopyLink={({ link }) => {
                    copyToClipboard(
                      `${APP_URL}${link}`,
                      'Link copied to clipboard!',
                    );
                  }}
                />
              </Disclosure>
              <div className="divider my-2" />
            </>
          ) : null}
          {data.completedFlights.length > 0 ? (
            <Disclosure
              buttonProps={{
                children: (
                  <span>
                    Completed Flights{' '}
                    {!isRowSelectEnabled
                      ? `(${data.completedFlights.length})`
                      : ''}
                  </span>
                ),
                color: 'ghost',
                size: 'lg',
              }}
              className="bg-base-100"
              defaultOpen={state?.defaultOpen !== 'upcoming'}
              rounded
            >
              <UserFlightsTable
                className="table-sm xl:table-md"
                data={data.completedFlights}
                dateBadgeColor="ghost"
                enableRowSelection={enableRowSelection}
                onCopyLink={({ link }) => {
                  copyToClipboard(
                    `${APP_URL}${link}`,
                    'Link copied to clipboard!',
                  );
                }}
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
      {layout === 'compact' &&
      !isLoading &&
      data !== undefined &&
      data.total > 0 ? (
        <UserFlightsTable
          className="shadow-sm"
          data={[
            ...data.upcomingFlights,
            ...data.currentFlights,
            ...data.completedFlights,
          ]}
          dateBadgeColor={({ inFuture }) => (inFuture ? 'secondary' : 'ghost')}
          enableRowSelection={enableRowSelection}
          onCopyLink={({ link }) => {
            copyToClipboard(`${APP_URL}${link}`, 'Link copied to clipboard!');
          }}
          size="sm"
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
      <DeleteFlightModal
        formControl={methods.control}
        isRowSelectEnabled={isRowSelectEnabled}
      />
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
