import { aircraft_type, airline, airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { format, isBefore } from 'date-fns';
import { Badge, Card } from 'react-daisyui';
import { LoadingCard, Table } from '../../common/components';
import { useFlightsQuery } from '../../common/hooks';

export const DATE_FORMAT = 'M/d/yyyy';

export const FlightsCard = (): JSX.Element => {
  const { data, isLoading } = useFlightsQuery();
  return (
    <LoadingCard
      isLoading={isLoading}
      className="shadow-xl bg-base-200 min-h-[400px] min-w-[500px]"
    >
      <Card.Body>
        <Card.Title className="mb-5 justify-center" tag="h2">
          My Flights
        </Card.Title>
        <Table
          columns={[
            {
              id: 'outTime',
              accessorKey: 'outTime',
              header: () => 'Date',
              cell: ({ getValue }) => {
                const isoTime = getValue<string>();
                const date = format(new Date(isoTime), DATE_FORMAT);
                const color = isBefore(new Date(isoTime), new Date())
                  ? 'primary'
                  : 'secondary';
                return <Badge color={color}>{date}</Badge>;
              },
              footer: () => null,
            },
            {
              id: 'airline',
              accessorKey: 'airline',
              header: () => 'Airline',
              cell: ({ getValue }) => {
                const airlineData = getValue<airline>();
                return airlineData?.logo !== null &&
                  airlineData?.logo !== undefined ? (
                  <div className="w-[120px] flex justify-center">
                    <img
                      className="max-w-[120px] max-h-[50px]"
                      src={airlineData.logo}
                    />
                  </div>
                ) : null;
              },
              footer: () => null,
              size: 300,
            },
            {
              id: 'departureAirport',
              accessorKey: 'departureAirport',
              header: () => 'Dep Airport',
              cell: ({ getValue }) => {
                const airportData = getValue<airport>();
                return (
                  <div>
                    <div className="font-bold">{airportData?.id}</div>
                    <div className="text-sm opacity-50">
                      {airportData?.municipality}
                    </div>
                  </div>
                );
              },
              footer: () => null,
            },
            {
              id: 'arrivalAirport',
              accessorKey: 'arrivalAirport',
              header: () => 'Arr Airport',
              cell: ({ getValue }) => {
                const airportData = getValue<airport>();
                return (
                  <div>
                    <div className="font-bold">{airportData?.id}</div>
                    <div className="text-sm opacity-50">
                      {airportData?.municipality}
                    </div>
                  </div>
                );
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
      </Card.Body>
    </LoadingCard>
  );
};
