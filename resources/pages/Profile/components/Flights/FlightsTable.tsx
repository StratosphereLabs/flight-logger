import type { AircraftType, Airline, Airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { Table } from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../../../app/routes/flights';

export interface FlightsTableProps {
  data: Array<FlightsRouterOutput['getUserFlightsBasic']['results'][number]>;
  isLoading: boolean;
}

export const FlightsTable = ({
  data,
  isLoading,
}: FlightsTableProps): JSX.Element => (
  <div className="flex max-w-fit flex-1 flex-col">
    <Table
      cellClassNames={{
        date: 'w-[45px] lg:w-[50px]',
        airline: 'w-[80px] py-[2px] lg:py-1',
        departureAirport: 'w-[40px] lg:w-[50px]',
        arrivalAirport: 'w-[40px] lg:w-[50px]',
      }}
      className="table-xs w-full min-w-[375px] max-w-[750px] table-fixed border-separate lg:table-sm lg:min-w-[465px]"
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
            const airlineData = getValue<Airline | null>();
            return airlineData?.logo !== null &&
              airlineData?.logo !== undefined ? (
              <div className="flex justify-start">
                <img
                  alt={`${airlineData.name} Logo`}
                  className="max-h-[20px] max-w-[64px] lg:max-h-[28px] lg:max-w-[68px]"
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
                <div className="hidden lg:block">
                  {airline?.iata ?? airline?.icao}
                </div>
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
            const airport = getValue<Airport>();
            return <div className="font-bold">{airport.iata}</div>;
          },
          footer: () => null,
        },
        {
          id: 'arrivalAirport',
          accessorKey: 'arrivalAirport',
          header: () => 'Arr',
          cell: ({ getValue, row }) => {
            const airport = getValue<Airport>();
            return (
              <div className="flex flex-wrap gap-x-1 font-bold">
                <span
                  className={classNames(
                    row.original.diversionAirport !== null &&
                      'line-through opacity-50',
                  )}
                >
                  {airport.iata}
                </span>
                {row.original.diversionAirport !== null ? (
                  <span>{row.original.diversionAirport.iata}</span>
                ) : null}
              </div>
            );
          },
          footer: () => null,
        },
        {
          id: 'duration',
          accessorKey: 'durationStringAbbreviated',
          header: () => 'Dur',
          cell: ({ getValue }) => {
            const duration = getValue<string>();
            return <div className="font-mono opacity-75">{duration}</div>;
          },
        },
        {
          id: 'aircraftType',
          accessorKey: 'aircraftType',
          header: () => 'Acft',
          cell: ({ getValue }) => {
            const aircraftType = getValue<AircraftType | null>();
            return <div className="opacity-75">{aircraftType?.icao}</div>;
          },
          footer: () => null,
        },
      ]}
      data={data}
      enableSorting={false}
      getCoreRowModel={getCoreRowModel()}
      isLoading={isLoading}
    />
  </div>
);
