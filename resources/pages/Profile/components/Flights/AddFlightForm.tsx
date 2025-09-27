import type { Airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { add, isAfter, isBefore, sub } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Button,
  CheckIcon,
  Form,
  FormControl,
  Table,
  Tabs,
  integerInputTransformer,
} from 'stratosphere-ui';

import { type FlightDataRouterOutput } from '../../../../../app/routes/flightData';
import { type AddFlightRequest } from '../../../../../app/schemas';
import {
  AirlineInput,
  FlightTimesDisplay,
  PlusIcon,
  SearchIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { useMainLayoutStore } from '../../../../layouts/MainLayout/mainLayoutStore';
import { trpc } from '../../../../utils/trpc';
import { ManualAddFormFields } from './ManualAddFormFields';
import { UserSelectModal } from './UserSelectModal';
import { useAddFlightStore } from './addFlightStore';
import { addFlightFormDefaultValues } from './constants';

export interface AddFlightFormProps {
  methods: UseFormReturn<AddFlightRequest>;
}

export const AddFlightForm = ({ methods }: AddFlightFormProps): JSX.Element => {
  const utils = trpc.useUtils();
  const { username } = useParams();
  const { onOwnProfile } = useLoggedInUserQuery();
  const { scrollContainerRef } = useMainLayoutStore();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    flightSearchFormData,
    selectedFlight,
    setFlightSearchFormData,
    setIsUserSelectModalOpen,
    setSelectedFlight,
  } = useAddFlightStore();
  const outDateISO = useWatch<AddFlightRequest, 'outDateISO'>({
    control: methods.control,
    name: 'outDateISO',
  });
  const airline = useWatch<AddFlightRequest, 'airline'>({
    control: methods.control,
    name: 'airline',
  });
  const [completedFlightIds, setCompletedFlightIds] = useState<number[]>([]);
  const [isShowingFormFields, setIsShowingFormFields] = useState(false);
  const [isShowingRegField, setIsShowingRegField] = useState(false);
  const onError = useTRPCErrorHandler();
  const { data, isFetching } =
    trpc.flightData.searchFlightsByFlightNumber.useQuery(
      flightSearchFormData ?? addFlightFormDefaultValues,
      {
        enabled: flightSearchFormData !== null,
        keepPreviousData: true,
        onError,
        onSuccess: ({ results }) => {
          setIsShowingFormFields(results.length === 0);
        },
      },
    );
  const { mutate: addFlightFromData, isLoading: isAddFlightFromDataLoading } =
    trpc.flightData.addFlightFromData.useMutation({
      onSuccess: () => {
        setIsUserSelectModalOpen(false);
        scrollContainerRef?.current?.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
        if (selectedFlight !== null) {
          setCompletedFlightIds(prevIds => [...prevIds, selectedFlight.id]);
          setSelectedFlight(null);
          void utils.users.invalidate();
          void utils.flights.invalidate();
          void utils.statistics.invalidate();
        }
      },
      onError,
    });
  const { mutate: addFlight, isLoading: isAddFlightLoading } =
    trpc.flights.addFlight.useMutation({
      onSuccess: () => {
        setIsUserSelectModalOpen(false);
        scrollContainerRef?.current?.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
        methods.reset(addFlightFormDefaultValues);
        void utils.users.invalidate();
        void utils.flights.invalidate();
        void utils.statistics.invalidate();
      },
      onError,
    });
  const departureDate = useWatch<AddFlightRequest, 'outDateISO'>({
    control: methods.control,
    name: 'outDateISO',
  });
  const shouldShowRegField = useMemo(
    () =>
      departureDate !== ''
        ? isBefore(new Date(departureDate), add(new Date(), { days: 3 }))
        : isShowingRegField,
    [departureDate, isShowingRegField],
  );
  const shouldShowFlightForm = useMemo(
    () =>
      outDateISO !== ''
        ? isBefore(new Date(outDateISO), sub(new Date(), { days: 8 })) ||
          isAfter(new Date(outDateISO), add(new Date(), { days: 8 }))
        : isShowingFormFields,
    [isShowingFormFields, outDateISO],
  );
  const handleAddFlightFromData = useCallback(
    (
      newFlight: FlightDataRouterOutput['searchFlightsByFlightNumber']['results'][number],
      username?: string,
    ) => {
      if (flightSearchFormData !== null) {
        addFlightFromData({
          username,
          airline: flightSearchFormData.airline,
          flightNumber: flightSearchFormData.flightNumber,
          departureIcao: newFlight.departureAirport.id,
          arrivalIcao: newFlight.arrivalAirport.id,
          outTime: newFlight.outTime,
          inTime: newFlight.inTime,
        });
      }
    },
    [addFlightFromData, flightSearchFormData],
  );
  useEffect(() => {
    setCompletedFlightIds([]);
  }, [data]);
  useEffect(() => {
    setIsShowingFormFields(shouldShowFlightForm);
    setTimeout(() => {
      methods.setFocus('outDateISO');
    });
  }, [methods, shouldShowFlightForm]);
  useEffect(() => {
    setIsShowingRegField(shouldShowRegField);
  }, [shouldShowRegField]);
  useEffect(() => {
    if (airline !== null) {
      methods.setFocus('flightNumber');
    }
  }, [airline, methods]);
  return (
    <div className="flex w-full max-w-[900px] flex-col items-center gap-6">
      <Form
        formRef={formRef}
        methods={methods}
        className="flex w-full flex-col justify-center gap-6"
        onFormSubmit={values => {
          if (onOwnProfile) {
            setIsUserSelectModalOpen(true);
          } else {
            addFlight({ ...values, username });
          }
        }}
      >
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:gap-2">
            <div className="flex flex-1 flex-wrap gap-x-2 gap-y-1">
              <FormControl
                bordered
                className="w-[160px]"
                inputClassName="bg-base-200"
                isRequired
                labelText="Departure Date"
                name="outDateISO"
                type="date"
              />
              <AirlineInput
                bordered
                className="max-w-[500px] min-w-[250px] flex-1"
                inputClassName="bg-base-200"
                isRequired
                labelText="Airline"
                menuClassName="w-full bg-base-200 z-50"
                name="airline"
              />
              <FormControl
                bordered
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
              className="w-full md:mt-[30px] md:w-[120px]"
              color="primary"
              loading={isFetching}
              disabled={!methods.formState.isDirty || shouldShowFlightForm}
              onClick={async () => {
                const isValid = await methods.trigger([
                  'outDateISO',
                  'airline',
                  'flightNumber',
                ]);
                if (isValid) {
                  setFlightSearchFormData(methods.getValues());
                }
              }}
              soft
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
        {data !== undefined ? (
          <>
            <Tabs
              lift
              onChange={tab => {
                setIsShowingFormFields(tab.id === 'manual');
              }}
              selectedTabId={isShowingFormFields ? 'manual' : 'results'}
              size="lg"
              tabs={[
                {
                  id: 'results',
                  disabled: shouldShowFlightForm,
                  children: 'Search Results',
                  className: 'flex-1',
                },
                {
                  id: 'manual',
                  children: 'Manual Add',
                  className: 'flex-1',
                },
              ]}
            />
            {!isShowingFormFields && data.results.length === 0 ? (
              <div className="text-center opacity-80">No Results</div>
            ) : null}
            {!isShowingFormFields && data.results.length > 0 ? (
              <Table
                cellClassNames={{
                  date: 'w-[50px] sm:w-[115px]',
                  airline: 'w-[120px] py-[2px] sm:py-1 hidden lg:table-cell',
                  flightNumber: 'w-[80px] hidden lg:table-cell',
                  departureAirport: 'min-w-[76px]',
                  arrivalAirport: 'min-w-[76px]',
                  duration: 'w-[55px] sm:w-[80px] hidden sm:table-cell',
                  actions: 'w-[100px] sm:w-[130px] pl-0',
                }}
                className="table-xs sm:table-sm table-fixed"
                columns={[
                  {
                    id: 'date',
                    accessorKey: 'outTimeDate',
                    cell: ({ getValue, row }) => {
                      const outTimeDate = getValue<string>();
                      return (
                        <div className="font-mono font-semibold whitespace-nowrap opacity-70">
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
                            className="mr-[-12px] max-h-[20px] max-w-[100px] sm:max-h-[28px]"
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
                      <div className="flex gap-1 font-mono text-base opacity-75">
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
                      const displayData = {
                        delayStatus: row.original.departureDelayStatus,
                        actualValue: row.original.outTimeActualValue,
                        value: row.original.outTimeValue,
                        actualLocal: row.original.outTimeActualLocal,
                        local: row.original.outTimeLocal,
                        actualDaysAdded: row.original.outTimeActualDaysAdded,
                        daysAdded: 0,
                      };
                      return (
                        <div className="flex flex-col">
                          <div className="flex flex-row gap-x-2 font-bold">
                            <div className="font-mono text-xl sm:text-2xl">
                              {airport.iata}
                            </div>
                            <FlightTimesDisplay
                              className="hidden sm:flex"
                              data={displayData}
                            />
                          </div>
                          <div className="truncate">
                            {row.original.departureMunicipalityText}
                          </div>
                          <FlightTimesDisplay
                            className="block sm:hidden"
                            data={displayData}
                          />
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
                      const displayData = {
                        delayStatus: row.original.arrivalDelayStatus,
                        actualValue: row.original.inTimeActualValue,
                        value: row.original.inTimeValue,
                        actualLocal: row.original.inTimeActualLocal,
                        local: row.original.inTimeLocal,
                        actualDaysAdded: row.original.inTimeActualDaysAdded,
                        daysAdded: row.original.inTimeDaysAdded,
                      };
                      return (
                        <div className="flex flex-col">
                          <div className="flex flex-col gap-x-2 font-bold sm:flex-row">
                            <div className="font-mono text-xl sm:text-2xl">
                              {airport.iata}
                            </div>
                            <FlightTimesDisplay
                              className="hidden sm:flex"
                              data={displayData}
                            />
                          </div>
                          <div className="truncate">
                            {row.original.arrivalMunicipalityText}
                          </div>
                          <FlightTimesDisplay
                            className="block sm:hidden"
                            data={displayData}
                          />
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
                        <div className="font-mono whitespace-nowrap opacity-75">
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
                        isAddFlightFromDataLoading;
                      const isAdded = completedFlightIds.includes(
                        row.original.id,
                      );
                      return (
                        <Button
                          className={classNames(
                            'btn-sm sm:btn-md w-full',
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
                                handleAddFlightFromData(row.original, username);
                              }
                            }
                          }}
                          soft
                        >
                          {!isLoading ? (
                            <>
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
                            </>
                          ) : null}
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
          </>
        ) : null}
        {isShowingFormFields ? (
          <ManualAddFormFields
            isAddFlightLoading={!onOwnProfile && isAddFlightLoading}
            isShowingRegField={isShowingRegField}
          />
        ) : null}
      </Form>
      <UserSelectModal
        flight={selectedFlight}
        isLoading={isAddFlightFromDataLoading || isAddFlightLoading}
        onSubmit={({ userType, username: selectedUsername }) => {
          if (!isShowingFormFields && selectedFlight !== null) {
            handleAddFlightFromData(
              selectedFlight,
              userType === 'other' &&
                selectedUsername !== null &&
                selectedUsername !== ''
                ? selectedUsername
                : undefined,
            );
          } else if (isShowingFormFields) {
            addFlight({
              ...methods.getValues(),
              username:
                selectedUsername !== null && selectedUsername !== ''
                  ? selectedUsername
                  : undefined,
            });
          }
        }}
      />
    </div>
  );
};
