import { zodResolver } from '@hookform/resolvers/zod';
import type { airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  FormControl,
  Table,
  integerInputTransformer,
} from 'stratosphere-ui';
import {
  fetchFlightsByFlightNumberSchema,
  type FetchFlightsByFlightNumberRequest,
} from '../../../app/schemas';
import { AirlineInput, PlusIcon, SearchIcon } from '../../common/components';
import { trpc } from '../../utils/trpc';
import { flightSearchFormDefaultValues } from './constants';

export const AddFlightForm = (): JSX.Element => {
  const methods = useForm<FetchFlightsByFlightNumberRequest>({
    defaultValues: flightSearchFormDefaultValues,
    resolver: zodResolver(fetchFlightsByFlightNumberSchema),
    reValidateMode: 'onBlur',
  });
  const [currentFormData, setCurrentFormData] =
    useState<FetchFlightsByFlightNumberRequest | null>(null);
  const { data, isFetching } =
    trpc.flightData.fetchFlightsByFlightNumber.useQuery(
      currentFormData ?? flightSearchFormDefaultValues,
      {
        enabled: currentFormData !== null,
      },
    );
  return (
    <>
      <Form
        methods={methods}
        className="mt-[-12px] flex w-full flex-wrap justify-end"
        onFormSubmit={values => {
          setCurrentFormData(values);
          methods.reset(values);
        }}
      >
        <div className="flex flex-1 flex-wrap gap-4">
          <FormControl
            className="min-w-[150px] max-w-[250px] flex-1"
            inputClassName="bg-base-100"
            isRequired
            labelText="Departure Date"
            name="outDateISO"
            size="sm"
            type="date"
          />
          <AirlineInput
            className="min-w-[175px] max-w-[500px] flex-[2]"
            dropdownInputClassName="input-sm"
            getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
            inputClassName="bg-base-100"
            isRequired
            labelText="Airline"
            menuClassName="w-full"
            name="airline"
            size="sm"
          />
          <FormControl
            className="min-w-[120px] max-w-[250px] flex-1"
            labelText="Flight No."
            inputClassName="bg-base-100"
            isRequired
            name="flightNumber"
            transform={integerInputTransformer}
            maxLength={4}
            size="sm"
          />
        </div>
        <Button
          className="ml-4 mt-9 flex w-[120px]"
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
      </Form>
      {data !== undefined && !isFetching ? (
        <Table
          cellClassNames={{
            date: 'w-[50px]',
            airline: 'w-[80px] py-[2px] sm:py-1 hidden sm:table-cell',
            flightNumber: 'w-[100px] hidden sm:table-cell',
            departureAirport: 'min-w-[76px]',
            arrivalAirport: 'min-w-[76px]',
            duration: 'w-[100px]',
            actions: 'max-w-[175px]',
          }}
          className="table-xs bg-base-100 sm:table-sm"
          columns={[
            {
              id: 'date',
              accessorKey: 'outTimeDate',
              header: () => 'Date',
              cell: ({ getValue }) => {
                const outTimeDate = getValue<string>();
                return (
                  <div className="font-mono font-bold opacity-70">
                    {outTimeDate}
                  </div>
                );
              },
            },
            {
              id: 'airline',
              accessorKey: 'airline',
              header: () => 'Airline',
              cell: ({ getValue }) => {
                return currentFormData?.airline?.logo !== null &&
                  currentFormData?.airline?.logo !== undefined ? (
                  <div className="flex justify-start">
                    <img
                      alt={`${currentFormData.airline.name} Logo`}
                      className="max-h-[20px] max-w-[68px] sm:max-h-[28px]"
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
              header: () => 'Flt #',
              cell: () => (
                <div className="flex gap-1 opacity-75">
                  <div className="hidden sm:block">
                    {currentFormData?.airline?.iata}
                  </div>
                  {currentFormData?.flightNumber}
                </div>
              ),
              footer: () => null,
            },
            {
              id: 'departureAirport',
              accessorKey: 'departureAirport',
              header: () => 'Dep',
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
              header: () => 'Arr',
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
              header: () => (
                <div className="w-full">
                  <div className="sm:hidden">Dur</div>
                  <div className="hidden sm:block">Duration</div>
                </div>
              ),
              cell: ({ getValue, row }) => {
                const duration = getValue<string>();
                return (
                  <div className="font-mono opacity-75">
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
              header: () => 'Actions',
              cell: () => (
                <Button className="btn-xs w-full min-w-[80px] sm:btn-sm">
                  <PlusIcon className="h-4 w-4" />
                  Add
                </Button>
              ),
              footer: () => null,
            },
          ]}
          data={data}
          enableSorting={false}
          getCoreRowModel={getCoreRowModel()}
        />
      ) : null}
    </>
  );
};
