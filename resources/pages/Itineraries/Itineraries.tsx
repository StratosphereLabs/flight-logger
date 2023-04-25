import { getCoreRowModel } from '@tanstack/react-table';
import { Card } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { LoadingCard, Table } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface DeleteFlightData {
  departureAirportId: string;
  arrivalAirportId: string;
  id: string;
}

export const Itineraries = (): JSX.Element => {
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserItineraries.useQuery({
    username,
  });
  useTRPCErrorHandler(error);
  console.log({ data });
  return (
    <>
      <LoadingCard
        isLoading={isFetching}
        className="min-h-[400px] min-w-[375px] bg-base-100 shadow-lg"
      >
        <Card.Body className="px-3">
          <Card.Title className="mb-5 justify-center" tag="h2">
            {username !== undefined
              ? `${username}'s Itineraries`
              : 'My Itineraries'}
          </Card.Title>
          <Table
            className="table-compact xl:table-normal"
            columns={[
              {
                id: 'name',
                accessorKey: 'name',
                header: () => 'Name',
                cell: ({ getValue }) => {
                  const name = getValue<string>();
                  return name;
                },
                footer: () => null,
              },
              {
                id: 'numFlights',
                accessorKey: 'numFlights',
                header: () => 'Legs',
                footer: () => null,
              },
            ]}
            cellClassNames={{}}
            data={data ?? []}
            enableFixedWidth
            enableSorting={false}
            getCoreRowModel={getCoreRowModel()}
          />
        </Card.Body>
      </LoadingCard>
    </>
  );
};
