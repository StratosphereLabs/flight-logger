import {
  type PaginationState,
  type SortingState,
  getCoreRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Card, CardBody, CardTitle, Table } from 'stratosphere-ui';

import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const AircraftTypesCard = (): JSX.Element => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.aircraftTypes.getAircraftTypes.useQuery(
    {
      limit: pagination.pageSize,
      cursor: pagination.pageIndex + 1,
      sort: sorting[0]?.desc ? 'desc' : 'asc',
      sortKey: sorting[0]?.id,
    },
    { onError },
  );
  return (
    <Card className="min-h-[550px] bg-base-100 shadow-sm">
      <CardBody>
        <CardTitle className="justify-center">Aircraft Types</CardTitle>
        <Table
          cellClassNames={{
            iata: 'w-[120px] hidden sm:table-cell',
            icao: 'w-[120px]',
          }}
          className="table-fixed border-separate"
          columns={[
            {
              id: 'iata',
              accessorKey: 'iata',
              header: () => 'IATA Code',
              footer: () => null,
            },
            {
              id: 'icao',
              accessorKey: 'icao',
              header: () => 'ICAO Code',
              footer: () => null,
            },
            {
              id: 'name',
              accessorKey: 'name',
              header: () => 'Name',
              cell: ({ getValue }) => {
                const name = getValue<string>();
                return <div className="truncate">{name}</div>;
              },
              footer: () => null,
            },
          ]}
          data={data?.results ?? []}
          enableRowHover
          getCoreRowModel={getCoreRowModel()}
          isLoading={isFetching}
          manualPagination
          metadata={data?.metadata}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          pageCount={data?.metadata?.pageCount}
          size="sm"
          state={{ pagination, sorting }}
        />
      </CardBody>
    </Card>
  );
};
