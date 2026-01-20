import type { AircraftType, Airline, Airport } from '@prisma/client';
import { useNavigate } from '@tanstack/react-router';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { Badge, Table } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../../../app/routes/flights';

export interface FlightsTableProps {
  data: Array<FlightsRouterOutput['getUserFlightsBasic']['results'][number]>;
  isLoading: boolean;
}

export const FlightsTable = ({
  data,
  isLoading,
}: FlightsTableProps): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div className="flex max-w-fit flex-1 flex-col">
      <Table
        cellClassNames={{
          year: 'w-[65px]',
          date: 'w-[45px] lg:w-[50px]',
          airline: 'w-[80px] py-[2px] lg:py-1',
          departureAirport: 'w-[40px] lg:w-[50px]',
        }}
        className="table-xs lg:table-sm w-full max-w-[750px] min-w-[375px] table-fixed border-separate lg:min-w-[465px]"
        columns={[
          {
            id: 'year',
            accessorKey: 'outTimeYear',
            header: () => 'Year',
            cell: ({ getValue }) => {
              const outDateYear = getValue<string>();
              return (
                <Badge
                  className="badge-md font-normal text-white"
                  color={
                    outDateYear === new Date().getFullYear().toString()
                      ? 'info'
                      : 'secondary'
                  }
                >
                  {outDateYear}
                </Badge>
              );
            },
          },
          {
            id: 'date',
            accessorKey: 'outTimeDate',
            header: () => 'Date',
            cell: ({ getValue }) => {
              const outTimeDate = getValue<string>();
              return (
                <div className="font-mono text-sm font-bold opacity-80">
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
                <div className="flex gap-1 font-mono text-sm opacity-90">
                  <div className="hidden lg:block">
                    {airline?.iata ?? airline?.icao}
                  </div>
                  <div className="font-semibold">{flightNumber}</div>
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
              return (
                <div className="font-mono text-sm font-bold">
                  {airport.iata}
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
              const airport = getValue<Airport>();
              return (
                <div className="flex flex-wrap gap-x-1 font-mono text-sm font-bold">
                  <span
                    className={classNames(
                      row.original.diversionAirport !== null &&
                        'line-through opacity-60',
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
            id: 'aircraftType',
            accessorKey: 'aircraftType',
            header: () => 'Acft',
            cell: ({ getValue }) => {
              const aircraftType = getValue<AircraftType | null>();
              return (
                <div className="font-mono text-sm opacity-80">
                  {aircraftType?.icao}
                </div>
              );
            },
            footer: () => null,
          },
        ]}
        data={data}
        enableSorting={false}
        getCoreRowModel={getCoreRowModel()}
        isLoading={isLoading}
        onRowClick={row =>
          navigate({
            to: `/flight/${row.original.id}`,
            params: { flightId: row.id },
          })
        }
        rowClassName="hover:opacity-75 transition-opacity hover:cursor-pointer"
      />
    </div>
  );
};
