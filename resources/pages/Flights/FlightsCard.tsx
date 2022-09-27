import { aircraft_type, airline } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { format } from 'date-fns';
import { LoadingCard, Table } from '../../common/components';
import { useFlightsQuery } from '../../common/hooks';

export const DATE_FORMAT = 'MM/dd/yyyy';

export const FlightsCard = (): JSX.Element => {
  const { data, isLoading } = useFlightsQuery();
  return (
    <LoadingCard
      isLoading={isLoading}
      className="shadow flex-1 bg-base-200 min-h-[400px] min-w-[500px]"
    >
      <div className="overflow-x-scroll w-full">
        <Table
          columns={[
            {
              id: 'airline',
              accessorKey: 'airline',
              header: () => 'Airline',
              cell: ({ getValue }) => {
                const airlineData = getValue<airline>();
                return airlineData?.logo !== null &&
                  airlineData?.logo !== undefined ? (
                  <img width="120px" src={airlineData.logo} />
                ) : null;
              },
              footer: () => null,
              size: 300,
            },
            {
              id: 'departureAirportId',
              accessorKey: 'departureAirportId',
              header: () => 'Dep Airport',
              footer: () => null,
            },
            {
              id: 'arrivalAirportId',
              accessorKey: 'arrivalAirportId',
              header: () => 'Arr Airport',
              footer: () => null,
            },
            {
              id: 'outTime',
              accessorKey: 'outTime',
              header: () => 'Date',
              cell: ({ getValue }) => {
                const isoTime = getValue<string>();
                return format(new Date(isoTime), DATE_FORMAT);
              },
              footer: () => null,
            },
            {
              id: 'aircraftType',
              accessorKey: 'aircraftType',
              header: () => 'Aircraft',
              cell: ({ getValue }) => {
                const aircraftType = getValue<aircraft_type>();
                return aircraftType?.name ?? '';
              },
              footer: () => null,
            },
            {
              id: 'flightNumber',
              accessorKey: 'flightNumber',
              header: () => 'Flight #',
              cell: ({ getValue, row }) => {
                const airlineData = row.getValue<airline>('airline');
                const flightNumber = getValue<number>();
                return `${airlineData?.iata ?? ''} ${flightNumber}`.trim();
              },
              footer: () => null,
            },
            {
              id: 'tailNumber',
              accessorKey: 'tailNumber',
              header: () => 'Registration',
              footer: () => null,
            },
          ]}
          data={data ?? []}
          enableRowHover
          getCoreRowModel={getCoreRowModel()}
        />
      </div>
    </LoadingCard>
  );
};
