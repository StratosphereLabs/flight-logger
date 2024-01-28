import { zodResolver } from '@hookform/resolvers/zod';
// import type { aircraft_type, airline, airport } from '@prisma/client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  FormControl,
  // Table,
  integerInputTransformer,
} from 'stratosphere-ui';
import {
  fetchFlightsByFlightNumberSchema,
  type FetchFlightsByFlightNumberRequest,
} from '../../../app/schemas';
import { AirlineInput, SearchIcon } from '../../common/components';
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
  console.log({ data });
  return (
    <>
      <Form
        methods={methods}
        className="mt-[-12px] flex w-full flex-wrap justify-end gap-4"
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
            className="min-w-[175px] max-w-[500px] flex-1"
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
          className="mt-9 flex w-[120px]"
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
      {/* <Table
        columns={[
          {
            id: 'airline',
            accessorKey: 'airline',
            header: () => 'Airline',
            cell: ({ getValue }) => {
              const airlineData = getValue<airline | null>();
              return airlineData?.logo !== null &&
                airlineData?.logo !== undefined ? (
                <div className="flex justify-start">
                  <img
                    alt={`${airlineData.name} Logo`}
                    className="max-h-[20px] max-w-[68px] sm:max-h-[28px]"
                    src={airlineData.logo}
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
            cell: ({ getValue, row }) => {
              const airline = row.original.airline;
              const flightNumber = getValue<number | null>();
              return (
                <div className="flex gap-1 opacity-75">
                  <div className="hidden sm:block">{airline?.iata}</div>
                  {flightNumber}
                </div>
              );
            },
            footer: () => null,
          },
          {
            id: 'departureAirport',
            accessorKey: 'departureAirport',
            header: () => 'Dep',
            cell: ({ getValue }) => {
              const airport = getValue<airport>();
              return <div className="font-bold">{airport.iata}</div>;
            },
            footer: () => null,
          },
          {
            id: 'arrivalAirport',
            accessorKey: 'arrivalAirport',
            header: () => 'Arr',
            cell: ({ getValue }) => {
              const airport = getValue<airport>();
              return <div className="font-bold">{airport.iata}</div>;
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
            id: 'aircraftType',
            accessorKey: 'aircraftType',
            header: () => 'Acft',
            cell: ({ getValue }) => {
              const aircraftType = getValue<aircraft_type | null>();
              return <div className="opacity-75">{aircraftType?.icao}</div>;
            },
            footer: () => null,
          },
        ]}
        data={data}
      /> */}
    </>
  );
};
