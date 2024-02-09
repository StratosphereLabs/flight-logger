import { getCoreRowModel } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';

export const TopCityPairsTable = (): JSX.Element => {
  const { username } = useParams();
  const { data } = trpc.statistics.getTopCityPairs.useQuery({
    username,
    limit: 5,
  });
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-semibold">Top City Pairs</div>
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
            id: 'cityPair',
            accessorKey: 'firstAirport',
            header: () => 'City Pair',
            cell: ({ row }) => {
              return (
                <div className="flex gap-2 font-mono text-xs font-semibold">
                  {row.original.firstAirport.iata} ⇔{' '}
                  {row.original.secondAirport.iata}
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
