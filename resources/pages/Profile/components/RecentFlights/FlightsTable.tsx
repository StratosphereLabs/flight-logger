import type { aircraft_type, airline, airport } from '@prisma/client';
import { Link, useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { type UsersRouterOutput } from '../../../../../app/routes/users';
import { getCoreRowModel } from '@tanstack/react-table';

export interface FlightsTableProps {
  count: number;
  data: Array<UsersRouterOutput['getUserCompletedFlights']['results'][number]>;
  isLoading: boolean;
  type: 'upcoming' | 'completed';
}

export const FlightsTable = ({
  count,
  data,
  isLoading,
  type,
}: FlightsTableProps): JSX.Element => {
  const { username } = useParams();
  const title = `${type === 'upcoming' ? 'Upcoming' : 'Completed'} Flights`;
  return (
    <div className="flex max-w-fit flex-1 flex-col">
      <article className="prose flex w-full items-end justify-between p-1">
        <h4 className="m-0 hidden lg:block">{title}</h4>
        <div className="text-prose-headings m-0 text-sm font-semibold lg:hidden">
          {title}
        </div>
        <Link
          to={username !== undefined ? `/user/${username}/flights` : '/flights'}
          className="link-hover link flex items-center gap-1 text-xs opacity-75"
          state={{
            defaultOpen: type,
          }}
        >
          View All ({count})
        </Link>
      </article>
      <Table
        cellClassNames={{
          date: 'w-[45px] lg:w-[50px]',
          airline: 'w-[80px] py-[2px] lg:py-1',
          departureAirport: 'w-[40px] lg:w-[50px]',
          arrivalAirport: 'w-[40px] lg:w-[50px]',
        }}
        className="table-xs w-full min-w-[375px] max-w-[750px] table-fixed border-separate bg-base-200 shadow-md lg:table-sm lg:max-w-[450px]"
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
              const airlineData = getValue<airline | null>();
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
              const aircraftType = getValue<aircraft_type | null>();
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
};
