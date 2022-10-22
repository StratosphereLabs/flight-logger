import { aircraft_type, airline, airport, flight } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { format, isBefore } from 'date-fns';
import { useState } from 'react';
import { Badge, Button, Card, Modal } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { LoadingCard, Table } from '../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../common/hooks';
import { trpc } from '../utils/trpc';

export const DATE_FORMAT = 'M/d/yyyy';

export const FlightsCard = (): JSX.Element => {
  const [deleteFlight, setDeleteFlight] = useState<flight | null>(null);
  const { username } = useParams();
  const handleSuccess = useSuccessResponseHandler();
  const { data, error, isLoading, refetch } =
    trpc.users.getUserFlights.useQuery({
      username,
    });
  const { isLoading: isDeleteFlightLoading, mutate } =
    trpc.users.deleteFlight.useMutation({
      onSuccess: async () => {
        handleSuccess('Flight Deleted');
        setDeleteFlight(null);
        await refetch();
      },
    });
  useTRPCErrorHandler(error?.data);
  return (
    <>
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
              {
                id: 'actions',
                header: () => 'Actions',
                cell: ({ row }) => (
                  <Button
                    onClick={() => setDeleteFlight(row.original)}
                    color="error"
                    size="xs"
                  >
                    Delete
                  </Button>
                ),
                footer: () => null,
              },
            ]}
            data={data ?? []}
            enableRowHover
            enableSorting={false}
            getCoreRowModel={getCoreRowModel()}
          />
        </Card.Body>
      </LoadingCard>
      <Modal open={deleteFlight !== null}>
        <Modal.Header className="font-bold">Delete Flight</Modal.Header>
        <Modal.Body>
          {`Are you sure you want to delete your ${
            deleteFlight?.departureAirportId ?? ''
          } - ${deleteFlight?.arrivalAirportId ?? ''} flight?`}
        </Modal.Body>
        <Modal.Actions>
          <Button color="ghost" onClick={() => setDeleteFlight(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            loading={isDeleteFlightLoading}
            onClick={() => mutate({ id: deleteFlight?.id ?? '' })}
          >
            Yes
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
