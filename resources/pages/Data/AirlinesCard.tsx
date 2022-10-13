import {
  getCoreRowModel,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Card } from 'react-daisyui';
import { LoadingCard, Table } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const AirlinesCard = (): JSX.Element => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isFetching } = trpc.airlines.getAirlines.useQuery({
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
    sort: sorting[0]?.desc ? 'desc' : 'asc',
    sortKey: sorting[0]?.id,
  });
  return (
    <LoadingCard className="shadow-xl bg-base-200 h-[625px]">
      <Card.Body>
        <Card.Title className="mb-3 justify-center" tag="h2">
          Airlines
        </Card.Title>
        <Table
          columns={[
            {
              id: 'logo',
              accessorKey: 'logo',
              header: () => 'Logo',
              cell: ({ getValue }) => {
                const logo = getValue<string>();
                return logo !== null && logo !== undefined ? (
                  <div className="w-[120px] flex justify-center">
                    <img className="max-w-[100px] max-h-[30px]" src={logo} />
                  </div>
                ) : null;
              },
              enableSorting: false,
              footer: () => null,
            },
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
