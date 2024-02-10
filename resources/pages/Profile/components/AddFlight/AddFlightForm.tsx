import { zodResolver } from '@hookform/resolvers/zod';
import type { airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  CheckIcon,
  Form,
  FormControl,
  Table,
  integerInputTransformer,
} from 'stratosphere-ui';
import {
  fetchFlightsByFlightNumberSchema,
  type FetchFlightsByFlightNumberRequest,
} from '../../../../../app/schemas';
import {
  AirlineInput,
  PlusIcon,
  SearchIcon,
} from '../../../../common/components';
import { trpc } from '../../../../utils/trpc';
import { flightSearchFormDefaultValues } from './constants';

export const AddFlightForm = (): JSX.Element => {
  const utils = trpc.useUtils();
  const methods = useForm<FetchFlightsByFlightNumberRequest>({
    defaultValues: flightSearchFormDefaultValues,
    resolver: zodResolver(fetchFlightsByFlightNumberSchema),
    reValidateMode: 'onBlur',
  });
  const [currentFormData, setCurrentFormData] =
    useState<FetchFlightsByFlightNumberRequest | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
  const [completedFlightIds, setCompletedFlightIds] = useState<number[]>([]);
  const { data, isFetching } =
    trpc.flightData.fetchFlightsByFlightNumber.useQuery(
      currentFormData ?? flightSearchFormDefaultValues,
      {
        enabled: currentFormData !== null,
      },
    );
  const { mutate, isLoading: isFlightDataLoading } =
    trpc.flightData.addFlightFromData.useMutation({
      onSuccess: () => {
        if (selectedFlightId !== null) {
          setCompletedFlightIds(prevIds => [...prevIds, selectedFlightId]);
          setSelectedFlightId(null);
          void utils.users.invalidate();
        }
      },
    });
  useEffect(() => {
    setCompletedFlightIds([]);
  }, [data]);
  return (
    <>
      <Form
        methods={methods}
        className="mt-[-12px] flex w-full flex-col gap-8 sm:flex-row"
        onFormSubmit={values => {
          setCurrentFormData(values);
          methods.reset(values);
        }}
      >
        <div className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
          <FormControl
            className="w-[150px]"
            inputClassName="bg-base-100"
            isRequired
            labelText="Departure Date"
            name="outDateISO"
            size="sm"
            type="date"
          />
          <AirlineInput
            className="min-w-[250px] max-w-[500px] flex-1"
            dropdownInputClassName="input-sm"
            getBadgeText={({ iata, icao, name }) =>
              `${iata !== null ? `${iata}/` : ''}${icao} - ${name}`
            }
            inputClassName="bg-base-100"
            isRequired
            labelText="Airline"
            menuClassName="w-full menu-sm"
            name="airline"
            size="sm"
          />
          <FormControl
            className="w-[125px]"
            labelText="Flight No."
            inputClassName="bg-base-100"
            isRequired
            name="flightNumber"
            transform={integerInputTransformer}
            maxLength={4}
            size="sm"
          />
        </div>
        <div className="flex w-full items-end justify-center sm:w-auto">
          <Button
            className="w-full min-w-[120px] max-w-[250px] sm:mt-9"
            color="neutral"
            loading={isFetching}
            disabled={!methods.formState.isDirty}
            size="sm"
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
            flightNumber: 'w-[100px] hidden sm:table-cell',
            departureAirport: 'min-w-[76px]',
            arrivalAirport: 'min-w-[76px]',
            duration: 'w-[100px]',
            actions: 'max-w-[175px]',
          }}
          className="table-xs sm:table-sm"
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
                <div className="flex gap-1 opacity-75">
                  <div className="hidden sm:block">
                    {currentFormData?.airline?.iata ??
                      currentFormData?.airline?.icao}
                  </div>
                  {currentFormData?.flightNumber}
                </div>
              ),
              footer: () => null,
            },
            {
              id: 'departureAirport',
              accessorKey: 'departureAirport',
              cell: ({ getValue, row }) => {
                const airport = getValue<airport>();
                return (
                  <div className="flex flex-wrap items-center">
                    <div className="mr-2 font-bold">{airport.iata}</div>
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
                const airport = getValue<airport>();
                return (
                  <div className="flex flex-wrap items-center">
                    <div className="mr-2 font-bold">{airport.iata}</div>
                    <div className="text-xs opacity-75">
                      {row.original.inTimeLocal}
                      {row.original.inTimeDaysAdded > 0 ? (
                        <sup>+{row.original.inTimeDaysAdded}</sup>
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
                  row.original.id === selectedFlightId && isFlightDataLoading;
                const isAdded = completedFlightIds.includes(row.original.id);
                return (
                  <Button
                    className={classNames(
                      'btn-xs w-full min-w-[80px] sm:btn-sm',
                      isAdded ? 'btn-success' : 'btn-info',
                    )}
                    disabled={isLoading}
                    loading={isLoading}
                    onClick={() => {
                      if (!isAdded && currentFormData !== null) {
                        setSelectedFlightId(row.original.id);
                        mutate({
                          airline: currentFormData.airline,
                          flightNumber: currentFormData.flightNumber,
                          departureIata: row.original.departureAirport.iata,
                          arrivalIata: row.original.arrivalAirport.iata,
                          outDateISO: row.original.outDateISO,
                        });
                      }
                    }}
                  >
                    {!isLoading && !isAdded ? (
                      <PlusIcon className="h-4 w-4" />
                    ) : null}
                    {!isLoading && isAdded ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : null}
                    {isAdded ? 'Added' : 'Add'}
                  </Button>
                );
              },
              footer: () => null,
            },
          ]}
          data={data}
          enableSorting={false}
          getCoreRowModel={getCoreRowModel()}
          hideHeader
        />
      ) : null}
      {data !== undefined && !isFetching && data.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-6 font-semibold">
          <div>No Flights Found</div>
          <Button
            color="primary"
            onClick={() => {
              alert('Coming Soon!');
            }}
          >
            <PlusIcon className="h-6 w-6" />
            Add Flight Info
          </Button>
        </div>
      ) : null}
    </>
  );
};
