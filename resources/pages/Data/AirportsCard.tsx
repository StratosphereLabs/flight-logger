import {
  getCoreRowModel,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Badge, Card } from 'react-daisyui';
import { LoadingCard } from 'stratosphere-ui';
import { Table } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

const getAirportTypeBadgeColor = (
  type: string,
): 'error' | 'primary' | 'ghost' | 'secondary' | 'info' | 'success' => {
  switch (type) {
    case 'closed':
      return 'error';
    case 'heliport':
      return 'success';
    case 'seaplane_base':
      return 'info';
    case 'small_airport':
      return 'ghost';
    case 'medium_airport':
      return 'secondary';
    case 'large_airport':
      return 'primary';
    default:
      return 'ghost';
  }
};

export const AirportsCard = (): JSX.Element => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, error, isFetching } = trpc.airports.getAirports.useQuery({
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
    sort: sorting[0]?.desc ? 'desc' : 'asc',
    sortKey: sorting[0]?.id,
  });
  useTRPCErrorHandler(error);
  return (
    <LoadingCard className="h-[625px] bg-base-100 shadow-lg">
      <Card.Body>
        <Card.Title className="mb-3 justify-center" tag="h2">
          Airports
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
              id: 'id',
              accessorKey: 'id',
              header: () => 'ICAO Code',
              footer: () => null,
            },
            {
              id: 'name',
              accessorKey: 'name',
              header: () => 'Name',
              footer: () => null,
            },
            {
              id: 'municipality',
              accessorKey: 'municipality',
              header: () => 'City',
              footer: () => null,
            },
            {
              id: 'regionId',
              accessorKey: 'regionId',
              header: () => 'Region',
              footer: () => null,
            },
            {
              id: 'countryId',
              accessorKey: 'countryId',
              header: () => 'Country',
              footer: () => null,
            },
            {
              id: 'type',
              accessorKey: 'type',
              header: () => 'Type',
              cell: ({ getValue }) => {
                const type = getValue<string>();
                const color = getAirportTypeBadgeColor(type);
                return <Badge color={color}>{type.split('_')[0]}</Badge>;
              },
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
