import type { Airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Button,
  CheckIcon,
  Form,
  FormControl,
  Table,
  integerInputTransformer,
} from 'stratosphere-ui';

import { type FlightDataRouterOutput } from '../../../../../app/routes/flightData';
import { type FlightSearchFormData } from '../../../../../app/schemas';
import {
  AirlineInput,
  PlusIcon,
  SearchIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { UserSelectModal } from './UserSelectModal';
import { useAddFlightStore } from './addFlightStore';
import { flightSearchFormDefaultValues } from './constants';

export interface AddFlightFormProps {
  methods: UseFormReturn<FlightSearchFormData>;
}

export const AddFlightForm = ({ methods }: AddFlightFormProps): JSX.Element => {
  const utils = trpc.useUtils();
  const { username } = useParams();
  const { onOwnProfile } = useLoggedInUserQuery();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    flightSearchFormData,
    selectedFlight,
    setFlightSearchFormData,
    setIsUserSelectModalOpen,
    setSelectedFlight,
  } = useAddFlightStore();
  const airline = useWatch<FlightSearchFormData, 'airline'>({
    control: methods.control,
    name: 'airline',
  });
  const [completedFlightIds, setCompletedFlightIds] = useState<number[]>([]);
  const onError = useTRPCErrorHandler();
  const { data, isFetching } =
    trpc.flightData.fetchFlightsByFlightNumber.useQuery(
      flightSearchFormData ?? flightSearchFormDefaultValues,
      {
        enabled: flightSearchFormData !== null,
        onError,
      },
    );
  const { mutate, isLoading: isFlightDataLoading } =
    trpc.flightData.addFlightFromData.useMutation({
      onSuccess: () => {
        setIsUserSelectModalOpen(false);
        if (selectedFlight !== null) {
          setCompletedFlightIds(prevIds => [...prevIds, selectedFlight.id]);
          setSelectedFlight(null);
          void utils.users.invalidate();
          void utils.flights.invalidate();
        }
      },
      onError,
    });
  const addFlight = useCallback(
    (
      newFlight: FlightDataRouterOutput['fetchFlightsByFlightNumber']['results'][number],
      username?: string,
    ) => {
      if (flightSearchFormData !== null)
        mutate({
          username,
          airline: flightSearchFormData.airline,
          flightNumber: flightSearchFormData.flightNumber,
          departureIcao: newFlight.departureAirport.id,
          arrivalIcao: newFlight.arrivalAirport.id,
          outTime: newFlight.outTime,
          inTime: newFlight.inTime,
        });
    },
    [flightSearchFormData, mutate],
  );
  useEffect(() => {
    setCompletedFlightIds([]);
  }, [data]);
  useEffect(() => {
    setTimeout(() => {
      methods.setFocus('outDateISO');
    });
  }, [methods]);
  useEffect(() => {
    if (airline !== null) {
      methods.setFocus('flightNumber');
    }
  }, [airline, methods]);
  return (
    <div className="mb-3 flex w-full max-w-[900px] flex-col items-center gap-6">
      <Form
        formRef={formRef}
        methods={methods}
        className="flex w-full flex-col justify-center gap-8 sm:flex-row"
        onFormSubmit={values => {
          setFlightSearchFormData(values);
          methods.reset(values);
        }}
      >
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:gap-2">
            <div className="flex flex-1 flex-wrap gap-x-2 gap-y-1">
              <FormControl
                className="w-[160px]"
                inputClassName="bg-base-200"
                isRequired
                labelText="Departure Date"
                name="outDateISO"
                type="date"
              />
              <AirlineInput
                className="min-w-[250px] max-w-[500px] flex-1"
                inputClassName="bg-base-200"
                isRequired
                labelText="Airline"
                menuClassName="w-full"
                name="airline"
              />
              <FormControl
                className="w-[120px]"
                labelText="Flight No."
                inputClassName="bg-base-200"
                isRequired
                name="flightNumber"
                transform={integerInputTransformer}
                maxLength={4}
              />
            </div>
            <Button
              className="w-full md:mt-9 md:w-[120px]"
              color="neutral"
              loading={isFetching}
              disabled={!methods.formState.isDirty}
              type="submit"
            >
              {!isFetching ? (
                <div className="flex w-6 justify-center">
                  <SearchIcon className="h-5 w-5" />
                </div>
              ) : null}
              Search
            </Button>
          </div>
        </div>
      </Form>
      {data !== undefined && !isFetching ? (
        <Table
          cellClassNames={{
            date: 'w-[50px] sm:w-[105px]',
            airline: 'w-[80px] py-[2px] sm:py-1 hidden sm:table-cell',
            flightNumber: 'w-[80px] hidden sm:table-cell',
            departureAirport: 'min-w-[76px]',
            arrivalAirport: 'min-w-[76px]',
            duration: 'w-[55px] sm:w-[80px]',
            actions: 'w-[100px] sm:w-[130px] pl-0',
          }}
          className="table-xs table-fixed"
          columns={[
            {
              id: 'date',
              accessorKey: 'outTimeDate',
              cell: ({ getValue, row }) => {
                const outTimeDate = getValue<string>();
                return (
                  <div className="whitespace-nowrap font-mono text-xs font-semibold opacity-70">
                    <div className="block sm:hidden">
                      {row.original.outTimeDateAbbreviated}
                    </div>
                    <div className="hidden sm:block">{outTimeDate}</div>
                  </div>
                );
              },
            },
            {
              id: 'airline',
              accessorKey: 'airline',
              cell: ({ getValue }) => {
                return flightSearchFormData?.airline?.logo !== null &&
                  flightSearchFormData?.airline?.logo !== undefined ? (
                  <div className="flex justify-start">
                    <img
                      alt={`${flightSearchFormData.airline.name} Logo`}
                      className="mr-[-12px] max-h-[20px] max-w-[68px] sm:max-h-[28px]"
                      src={flightSearchFormData.airline.logo}
                    />
                  </div>
                ) : null;
              },
              footer: () => null,
            },
            {
              id: 'flightNumber',
              accessorKey: 'flightNumber',
              cell: () => (
                <div className="flex gap-1 font-mono opacity-75">
                  <div className="hidden sm:block">
                    {flightSearchFormData?.airline?.iata ??
                      flightSearchFormData?.airline?.icao}
                  </div>
                  <span className="font-semibold">
                    {flightSearchFormData?.flightNumber}
                  </span>
                </div>
              ),
              footer: () => null,
            },
            {
              id: 'departureAirport',
              accessorKey: 'departureAirport',
              cell: ({ getValue, row }) => {
                const airport = getValue<Airport>();
                return (
                  <div className="flex flex-wrap items-center gap-x-2 font-bold">
                    <div className="font-mono text-lg">{airport.iata}</div>
                    <div className="text-xs opacity-75">
                      {row.original.outTimeLocal}
                    </div>
                  </div>
                );
              },
              footer: () => null,
            },
            {
              id: 'arrivalAirport',
              accessorKey: 'arrivalAirport',
              cell: ({ getValue, row }) => {
                const airport = getValue<Airport>();
                return (
                  <div className="flex flex-wrap items-center gap-x-2 font-bold">
                    <div className="font-mono text-lg">{airport.iata}</div>
                    <div className="text-xs opacity-75">
                      {row.original.inTimeLocal}
                      {row.original.inTimeDaysAdded !== 0 ? (
                        <sup>
                          {`${row.original.inTimeDaysAdded > 0 ? '+' : ''}${row.original.inTimeDaysAdded}`}
                        </sup>
                      ) : null}
                    </div>
                  </div>
                );
              },
              footer: () => null,
            },
            {
              id: 'duration',
              accessorKey: 'durationString',
              cell: ({ getValue, row }) => {
                const duration = getValue<string>();
                return (
                  <div className="whitespace-nowrap font-mono opacity-75">
                    <div className="sm:hidden">
                      {row.original.durationStringAbbreviated}
                    </div>
                    <div className="hidden sm:block">{duration}</div>
                  </div>
                );
              },
            },
            {
              id: 'actions',
              cell: ({ row }) => {
                const isLoading =
                  !onOwnProfile &&
                  row.original.id === selectedFlight?.id &&
                  isFlightDataLoading;
                const isAdded = completedFlightIds.includes(row.original.id);
                return (
                  <Button
                    className={classNames(
                      'btn-sm w-full sm:btn-md',
                      isAdded ? 'btn-success' : 'btn-primary',
                    )}
                    disabled={isLoading}
                    loading={isLoading}
                    onClick={() => {
                      if (!isAdded) {
                        setSelectedFlight(row.original);
                        if (onOwnProfile) {
                          setIsUserSelectModalOpen(true);
                        } else {
                          addFlight(row.original, username);
                        }
                      }
                    }}
                  >
                    {isAdded ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                    {isAdded ? (
                      <span className="hidden sm:block">Added</span>
                    ) : (
                      'Add'
                    )}
                  </Button>
                );
              },
              footer: () => null,
            },
          ]}
          data={data.results}
          enableSorting={false}
          enableRowHover
          getCoreRowModel={getCoreRowModel()}
          hideHeader
        />
      ) : null}
      {data !== undefined && !isFetching ? (
        <div className="flex w-full flex-col items-center gap-6 font-semibold">
          {data.results.length === 0 ? <div>No Flights Found</div> : null}
          <Button
            color={data.results.length === 0 ? 'primary' : 'ghost'}
            onClick={() => {
              alert('Coming Soon!');
            }}
          >
            <PlusIcon className="h-6 w-6" />
            Add Flight Manually
          </Button>
        </div>
      ) : null}
      <UserSelectModal
        isLoading={isFlightDataLoading}
        onSubmit={({ userType, username: selectedUsername }) => {
          if (selectedFlight !== null) {
            addFlight(
              selectedFlight,
              userType === 'other' && selectedUsername !== null
                ? selectedUsername
                : undefined,
            );
          }
        }}
      />
    </div>
  );
};
