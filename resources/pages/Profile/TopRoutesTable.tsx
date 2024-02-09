import { getCoreRowModel } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';

export const TopRoutesTable = (): JSX.Element => {
  const { username } = useParams();
  const { data } = trpc.statistics.getTopRoutes.useQuery({
    username,
    limit: 5,
  });
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-semibold">Top Routes</div>
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
            id: 'route',
            accessorKey: 'departureAirport',
            header: () => 'Route',
            cell: ({ row }) => {
              return (
                <div className="flex gap-2 font-mono text-xs font-semibold">
                  {row.original.departureAirport.iata} →{' '}
                  {row.original.arrivalAirport.iata}
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
