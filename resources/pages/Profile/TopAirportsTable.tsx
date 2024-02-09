import type { airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';

export const TopAirportsTable = (): JSX.Element => {
  const { username } = useParams();
  const { data } = trpc.statistics.getTopAirports.useQuery({
    username,
    limit: 5,
  });
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-semibold">Top Airports</div>
      <Table
        columns={[
          {
            id: 'rank',
            accessorKey: 'id',
            header: () => '',
            cell: ({ getValue }) => {
              const value = getValue<number>();
              return <div className="opacity-75">{value}</div>;
            },
            footer: () => null,
          },

          {
            id: 'airport',
            accessorKey: 'airport',
            header: () => 'Airport',
            cell: ({ getValue }) => {
              const airportData = getValue<airport | null>();
              if (airportData === null) return null;
              return (
                <div className="flex gap-2 font-mono text-xs font-semibold">
                  {airportData.iata}
                  <span className="text-[0.6rem] opacity-75">
                    / {airportData.id}
                  </span>
                </div>
              );
            },
            footer: () => null,
          },
          {
            id: 'count',
            accessorKey: 'count',
            header: () => '#',
            cell: ({ getValue }) => {
              const value = getValue<number>();
              return (
                <div className="font-mono font-semibold opacity-75">
                  {value}
                </div>
              );
            },
            footer: () => null,
          },
        ]}
        data={data ?? []}
        enableSorting={false}
        getCoreRowModel={getCoreRowModel()}
        size="xs"
      />
    </div>
  );
};
