import {
  getCoreRowModel,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Card } from 'react-daisyui';
import { LoadingCard } from 'stratosphere-ui';
import { Table } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const AircraftTypesCard = (): JSX.Element => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, error, isFetching } =
    trpc.aircraftTypes.getAircraftTypes.useQuery({
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
      sort: sorting[0]?.desc ? 'desc' : 'asc',
      sortKey: sorting[0]?.id,
    });
  useTRPCErrorHandler(error);
  return (
    <LoadingCard className="h-[550px] bg-base-100 shadow-lg">
      <Card.Body>
        <Card.Title className="mb-3 justify-center" tag="h2">
          Aircraft Types
        </Card.Title>
        <Table
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
              footer: () => null,
            },
          ]}
          compact
          data={data?.results ?? []}
          enableFixedWidth
          enableRowHover
          getCoreRowModel={getCoreRowModel()}
          isLoading={isFetching}
          manualPagination
          metadata={data?.metadata}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          pageCount={data?.metadata?.pageCount}
          state={{ pagination, sorting }}
        />
      </Card.Body>
    </LoadingCard>
  );
};
