import type { airline } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';

export const TopAirlinesTable = (): JSX.Element => {
  const { username } = useParams();
  const { data } = trpc.statistics.getTopAirlines.useQuery({
    username,
    limit: 5,
  });
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-semibold">Top Airlines</div>
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
            id: 'airlineCodes',
            accessorKey: 'airline',
            header: () => 'Airline',
            cell: ({ getValue }) => {
              const airlineData = getValue<airline | null>();
              if (airlineData === null) return null;
              return (
                <div className="flex gap-2 font-mono text-xs font-semibold">
                  {airlineData.iata}
                  <span className="text-[0.6rem] opacity-75">
                    / {airlineData.icao}
                  </span>
                </div>
              );
            },
            footer: () => null,
          },
          {
            id: 'airlineLogo',
            accessorKey: 'airline',
            header: () => '',
            cell: ({ getValue }) => {
              const airlineData = getValue<airline | null>();
              if (airlineData?.logo === null || airlineData?.logo === undefined)
                return null;
              return (
                <img
                  alt={`${airlineData.name} Logo`}
                  className="my-[-2px] max-h-[21px] max-w-[55px]"
                  src={airlineData.logo}
                />
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
