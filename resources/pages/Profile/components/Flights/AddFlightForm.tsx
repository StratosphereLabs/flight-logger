import { zodResolver } from '@hookform/resolvers/zod';
import type { Airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  CheckIcon,
  Form,
  FormControl,
  FormRadioGroup,
  FormRadioGroupOption,
  Table,
  integerInputTransformer,
} from 'stratosphere-ui';

import { type FlightDataRouterOutput } from '../../../../../app/routes/flightData';
import {
  type FlightSearchFormData,
  searchFlightDataSchema,
} from '../../../../../app/schemas';
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
import { flightSearchFormDefaultValues } from './constants';

export const AddFlightForm = (): JSX.Element => {
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const { username } = useParams();
  const { onOwnProfile } = useLoggedInUserQuery();
  const formRef = useRef<HTMLFormElement>(null);
  const methods = useForm<FlightSearchFormData>({
    defaultValues: {
      ...flightSearchFormDefaultValues,
      userType: onOwnProfile ? 'me' : 'other',
    },
    resolver: zodResolver(searchFlightDataSchema),
    reValidateMode: 'onBlur',
  });
  const airline = useWatch<FlightSearchFormData, 'airline'>({
    control: methods.control,
    name: 'airline',
  });
  const [currentFormData, setCurrentFormData] =
    useState<FlightSearchFormData | null>(null);
  const userType = useWatch<FlightSearchFormData, 'userType'>({
    name: 'userType',
    control: methods.control,
  });
  const [isUserSelectModalOpen, setIsUserSelectModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<
    FlightDataRouterOutput['fetchFlightsByFlightNumber'][number] | null
  >(null);
  const [completedFlightIds, setCompletedFlightIds] = useState<number[]>([]);
  const onError = useTRPCErrorHandler();
  const { data, isFetching } =
    trpc.flightData.fetchFlightsByFlightNumber.useQuery(
      currentFormData ?? flightSearchFormDefaultValues,
      {
        enabled: currentFormData !== null,
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
      newFlight: FlightDataRouterOutput['fetchFlightsByFlightNumber'][number],
      username?: string,
    ) => {
      if (currentFormData !== null)
        mutate({
          username,
          airline: currentFormData.airline,
          flightNumber: currentFormData.flightNumber,
          departureIcao: newFlight.departureAirport.id,
          arrivalIcao: newFlight.arrivalAirport.id,
          outTime: newFlight.outTime,
          inTime: newFlight.inTime,
        });
    },
    [currentFormData, mutate],
  );
  useEffect(() => {
    setCompletedFlightIds([]);
  }, [data]);
  useEffect(() => {
    setTimeout(() => {
      methods.setFocus('outDateISO');
      formRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    });
  }, [methods]);
  useEffect(() => {
    if (airline !== null) {
      methods.setFocus('flightNumber');
    }
  }, [airline, methods]);
  return (
    <div className="mb-3 flex flex-col gap-3">
      <Form
        formRef={formRef}
        methods={methods}
        className="flex w-full flex-col justify-between gap-8 sm:flex-row"
        onFormSubmit={values => {
          setCurrentFormData(values);
          methods.reset(values);
        }}
      >
        <div className="flex w-full max-w-[700px] flex-col gap-4">
          {onOwnProfile ? (
            <FormRadioGroup className="w-full" name="userType">
              <FormRadioGroupOption
                activeColor="info"
                className="mr-[1px] flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
                value="me"
              >
                Myself
              </FormRadioGroupOption>
              <FormRadioGroupOption
                activeColor="info"
                className="flex-1 border-2 border-opacity-50 bg-opacity-25 text-base-content hover:border-opacity-80 hover:bg-opacity-40"
                value="other"
              >
                Other User
              </FormRadioGroupOption>
            </FormRadioGroup>
          ) : null}
          <div className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
            <FormControl
              className="w-[150px]"
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
              className="w-[150px]"
              labelText="Flight No."
              inputClassName="bg-base-200"
              isRequired
              name="flightNumber"
              transform={integerInputTransformer}
              maxLength={4}
            />
          </div>
        </div>
        <div className="flex w-full items-end justify-center sm:w-auto">
          <Button
            className="w-full min-w-[120px] max-w-[250px] sm:mt-9"
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
                return currentFormData?.airline?.logo !== null &&
                  currentFormData?.airline?.logo !== undefined ? (
                  <div className="flex justify-start">
                    <img
                      alt={`${currentFormData.airline.name} Logo`}
                      className="mr-[-12px] max-h-[20px] max-w-[68px] sm:max-h-[28px]"
                      src={currentFormData.airline.logo}
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
                    {currentFormData?.airline?.iata ??
                      currentFormData?.airline?.icao}
                  </div>
                  <span className="font-semibold">
                    {currentFormData?.flightNumber}
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
                  (userType === 'me' || !onOwnProfile) &&
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
                        if (userType === 'other' && onOwnProfile) {
                          setIsUserSelectModalOpen(true);
                        } else {
                          addFlight(
                            row.original,
                            !onOwnProfile ? username : undefined,
                          );
                        }
                      }
                    }}
                  >
                    {!isLoading && !isAdded ? (
                      <PlusIcon className="h-4 w-4" />
                    ) : null}
                    {!isLoading && isAdded ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : null}
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
          data={data}
          enableSorting={false}
          enableRowHover
          getCoreRowModel={getCoreRowModel()}
          hideHeader
        />
      ) : null}
      {data !== undefined && !isFetching ? (
        <div className="flex w-full flex-col items-center gap-6 font-semibold">
          {data.length === 0 ? <div>No Flights Found</div> : null}
          <Button
            color={data.length === 0 ? 'primary' : 'ghost'}
            onClick={() => {
              navigate('/add-flight');
            }}
          >
            <PlusIcon className="h-6 w-6" />
            Add Flight Manually
          </Button>
        </div>
      ) : null}
      <UserSelectModal
        isLoading={isFlightDataLoading}
        isOpen={isUserSelectModalOpen}
        onSubmit={({ username: selectedUsername }) => {
          if (selectedFlight !== null && selectedUsername !== null)
            addFlight(selectedFlight, selectedUsername);
        }}
        setIsOpen={setIsUserSelectModalOpen}
      />
    </div>
  );
};
