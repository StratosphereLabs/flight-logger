import {
  type PaginationState,
  type SortingState,
  getCoreRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Badge,
  type BadgeColor,
  Card,
  CardBody,
  CardTitle,
  Table,
} from 'stratosphere-ui';

import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

const getAirportTypeBadgeColor = (type: string): BadgeColor => {
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
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.airports.getAirports.useQuery(
    {
      limit: pagination.pageSize,
      cursor: pagination.pageIndex + 1,
      sort: sorting[0]?.desc ? 'desc' : 'asc',
      sortKey: sorting[0]?.id,
    },
    { onError },
  );
  return (
    <Card className="bg-base-100 min-h-[550px] shadow-xs">
      <CardBody>
        <CardTitle className="mb-3 justify-center">Airports</CardTitle>
        <Table
          cellClassNames={{
            iata: 'w-[120px] hidden md:table-cell',
            id: 'w-[120px]',
            municipality: 'hidden lg:table-cell',
            regionId: 'w-[120px] hidden md:table-cell',
            countryId: 'w-[120px] hidden sm:table-cell',
            type: 'w-[120px] hidden sm:table-cell',
          }}
          className="bg-base-100 table-fixed border-separate"
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
              cell: ({ getValue }) => {
                const name = getValue<string>();
                return <div className="truncate">{name}</div>;
              },
              footer: () => null,
            },
            {
              id: 'municipality',
              accessorKey: 'municipality',
              header: () => 'City',
              cell: ({ getValue }) => {
                const municipality = getValue<string>();
                return <div className="truncate">{municipality}</div>;
              },
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
