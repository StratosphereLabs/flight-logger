import type { aircraft_type, airline, airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { useProfilePage } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const UpcomingFlights = (): JSX.Element => {
  const enabled = useProfilePage();
  const { username } = useParams();
  const { data, isFetching } =
    trpc.users.getUserUpcomingFlights.useInfiniteQuery(
      {
        limit: 5,
        username,
      },
      { enabled },
    );
  const flattenedData = useMemo(
    () => data?.pages.flatMap(({ results }) => results),
    [data?.pages],
  );
  return (
    <div className="flex flex-col">
      <article className="prose flex min-w-[350px] max-w-[550px] items-end justify-between p-1">
        <h4>Upcoming Flights</h4>
        <Link
          to={username !== undefined ? `/user/${username}/flights` : '/flights'}
          className="link-hover link flex items-center gap-1 text-xs opacity-75"
        >
          View All ({data?.pages[0].count})
        </Link>
      </article>
      <Table
        cellClassNames={{
          date: 'w-[50px]',
          airline: 'w-[80px]',
          duration: 'hidden sm:table-cell',
          aircraftType: 'hidden sm:table-cell',
          departureAirport: 'w-[50px]',
          arrivalAirport: 'w-[50px]',
        }}
        className="min-w-[350px] max-w-[550px] table-fixed border-separate bg-base-200"
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
                    className="max-h-[20px] max-w-[68px]"
                    src={airlineData.logo}
                  />
                </div>
              ) : null;
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
            id: 'flightNumber',
            accessorKey: 'flightNumber',
            header: () => 'Flt #',
            cell: ({ getValue, row }) => {
              const airline = row.original.airline;
              const flightNumber = getValue<number | null>();
              return (
                <div className="opacity-75">
                  {airline?.iata} {flightNumber}
                </div>
              );
            },
            footer: () => null,
          },
          {
            id: 'duration',
            accessorKey: 'durationString',
            header: () => <div className="w-full text-right">Duration</div>,
            cell: ({ getValue }) => {
              const duration = getValue<string>();
              return (
                <div className="text-right font-mono opacity-75">
                  {duration}
                </div>
              );
            },
          },
          {
            id: 'aircraftType',
            accessorKey: 'aircraftType',
            header: () => 'Acft',
            cell: ({ getValue, row }) => {
              const aircraftType = getValue<aircraft_type | null>();
              return <div className="opacity-75">{aircraftType?.icao}</div>;
            },
            footer: () => null,
          },
        ]}
        data={flattenedData ?? []}
        enableSorting={false}
        getCoreRowModel={getCoreRowModel()}
        isLoading={isFetching}
        size="sm"
      />
    </div>
  );
};
