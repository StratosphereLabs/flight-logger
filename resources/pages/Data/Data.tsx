import { getCoreRowModel } from '@tanstack/react-table';
import { useState } from 'react';
import { Card } from 'react-daisyui';
import { LoadingCard, Table } from '../../common/components';
import { useAircraftTypesQuery } from '../../common/hooks';

export const Data = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading } = useAircraftTypesQuery({ page, limit });
  return (
    <div className="p-4">
      <LoadingCard
        isLoading={isLoading}
        className="shadow-xl flex-1 bg-base-200 min-h-[400px] min-w-[500px]"
      >
        <Card.Body>
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
            data={data ?? []}
            enableRowHover
            getCoreRowModel={getCoreRowModel()}
          />
        </Card.Body>
      </LoadingCard>
    </div>
  );
};
