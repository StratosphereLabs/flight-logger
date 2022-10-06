import { getCoreRowModel, PaginationState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Card } from 'react-daisyui';
import { LoadingCard, Table } from '../../common/components';
import { useAircraftTypesQuery } from '../../common/hooks';

export const AircraftTypesCard = (): JSX.Element => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  );
  const { data, isLoading } = useAircraftTypesQuery(pagination);
  return (
    <LoadingCard className="shadow-xl bg-base-200 h-full">
      <Card.Body>
        <Card.Title className="mb-3">Aircraft Types</Card.Title>
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
          enableRowHover
          getCoreRowModel={getCoreRowModel()}
          isLoading={isLoading}
          manualPagination
          metadata={data?.metadata}
          onPaginationChange={setPagination}
          pageCount={data?.metadata?.pageCount}
          state={{ pagination }}
        />
      </Card.Body>
    </LoadingCard>
  );
};
