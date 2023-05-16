import { useEffect, useState } from 'react';
import { Button, Progress } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  CloseIcon,
  Disclosure,
  Form,
  FormRadioGroup,
  FormRadioGroupOption,
  useAlertMessages,
} from 'stratosphere-ui';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { useFlightsPageStore } from './flightsPageStore';
import { ViewFlightModal } from './ViewFlightModal';
import {
  Bars2Icon,
  Bars4Icon,
  UserFlightsTable,
} from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { UsersRouterOutput } from '../../../app/routes/users';

interface FlightsData {
  flights: UsersRouterOutput['getUserFlights'];
  upcomingFlights: UsersRouterOutput['getUserFlights'];
}

export const Flights = (): JSX.Element => {
  const methods = useForm({
    defaultValues: {
      layout: 'full',
    },
  });
  const layout = methods.watch('layout');
  const { username } = useParams();
  const [isRowSelectEnabled, setIsRowSelectEnabled] = useState(false);
  const { addAlertMessages } = useAlertMessages();
  const { rowSelection, resetRowSelection } = useFlightsPageStore();
  useEffect(() => {
    if (!isRowSelectEnabled) resetRowSelection();
  }, [isRowSelectEnabled]);
  const { data, error, isFetching, refetch } =
    trpc.users.getUserFlights.useQuery(
      {
        username,
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
      },
    );
  useTRPCErrorHandler(error);
  return (
    <div className="flex flex-col gap-4">
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
                color={isRowSelectEnabled ? 'error' : undefined}
                startIcon={
                  isRowSelectEnabled ? <CloseIcon className="h-4 w-4" /> : null
                }
                onClick={() => setIsRowSelectEnabled(isEnabled => !isEnabled)}
                size="sm"
                type="button"
              >
                {isRowSelectEnabled ? 'Cancel' : 'Select'}
              </Button>
              {isRowSelectEnabled ? (
                <Button
                  color="primary"
                  disabled={Object.keys(rowSelection).length === 0}
                  onClick={() =>
                    addAlertMessages([
                      {
                        status: 'info',
                        message: 'Coming soon!',
                      },
                    ])
                  }
                  size="sm"
                  type="button"
                >
                  Create trip ({Object.keys(rowSelection).length})
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
      {isFetching ? <Progress /> : null}
      {!isFetching && data !== undefined && layout === 'full' ? (
        <>
          <Disclosure
            buttonProps={{
              children: (
                <span>Upcoming Flights ({data.upcomingFlights.length})</span>
              ),
              color: 'ghost',
              size: 'lg',
            }}
            rounded
          >
            <UserFlightsTable
              data={data.upcomingFlights}
              enableRowSelection={isRowSelectEnabled}
            />
          </Disclosure>
          <Disclosure
            buttonProps={{
              children: <span>Completed Flights ({data.flights.length})</span>,
              color: 'ghost',
              size: 'lg',
            }}
            defaultOpen
            rounded
          >
            <UserFlightsTable
              data={data.flights}
              enableRowSelection={isRowSelectEnabled}
            />
          </Disclosure>
        </>
      ) : null}
      {!isFetching && data !== undefined && layout === 'compact' ? (
        <UserFlightsTable
          data={[...data.upcomingFlights, ...data.flights]}
          enableRowSelection={isRowSelectEnabled}
        />
      ) : null}
      <DeleteFlightModal />
      <EditFlightModal onSuccess={async () => await refetch()} />
      <ViewFlightModal />
    </div>
  );
};
