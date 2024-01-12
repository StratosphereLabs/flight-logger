import type { aircraft_type, airline, airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';

export const UpcomingFlights = (): JSX.Element => {
  const { username } = useParams();
  const { data, isFetching } =
    trpc.users.getUserUpcomingFlights.useInfiniteQuery({
      limit: 5,
      username,
    });
  const flattenedData = useMemo(() => data?.pages.flat(), [data?.pages]);
  return (
    <div className="flex flex-1 flex-col">
      <article className="prose pl-2">
        <h4>Upcoming Flights</h4>
      </article>
      <Table
        cellClassNames={{
          date: 'w-[60px]',
          airline: 'w-[80px]',
          departureAirport: 'w-[50px]',
          arrivalAirport: 'w-[50px]',
        }}
        className="min-w-[500px] table-fixed border-separate bg-base-200"
        columns={[
          {
            id: 'date',
            accessorKey: 'outTimeDate',
            header: () => '',
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
            header: () => '',
            cell: ({ getValue }) => {
              const airlineData = getValue<airline>();
              return airlineData?.logo !== null &&
                airlineData?.logo !== undefined ? (
                <div className="flex w-[50px] justify-center">
                  <img
                    alt={`${airlineData.name} Logo`}
                    className="max-h-[20px] max-w-[75px]"
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
            cell: ({ getValue, row }) => {
              const aircraftType = getValue<aircraft_type>();
              return <div className="opacity-75">{aircraftType.icao}</div>;
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
