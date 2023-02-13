import { aircraft_type, airline, airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { format, isBefore } from 'date-fns';
import { useState } from 'react';
import { Badge, Button, Card } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { LoadingCard, Modal, Table, useAlertMessages } from 'stratosphere-ui';
import { EditIcon, LinkIcon, TrashIcon, ViewIcon } from '../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../common/hooks';
import { trpc } from '../utils/trpc';

export const DATE_FORMAT = 'yyyy-MM-dd';

export interface DeleteFlightData {
  departureAirportId: string;
  arrivalAirportId: string;
  id: string;
}

export const FlightsCard = (): JSX.Element => {
  const utils = trpc.useContext();
  const { addAlertMessages } = useAlertMessages();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteFlightData, setDeleteFlightData] =
    useState<DeleteFlightData | null>(null);
  const { username } = useParams();
  const handleSuccess = useSuccessResponseHandler();
  const { data, error, isFetching } = trpc.users.getUserFlights.useQuery({
    username,
  });
  const { isLoading, mutate } = trpc.users.deleteFlight.useMutation({
    onSuccess: ({ id }) => {
      handleSuccess('Flight Deleted');
      setIsDeleteDialogOpen(false);
      const previousFlights = utils.users.getUserFlights.getData({
        username,
      });
      utils.users.getUserFlights.setData(
        { username },
        previousFlights?.filter(flight => flight.id !== id),
      );
    },
    onError: err => {
      addAlertMessages([
        {
          status: 'error',
          message: err.message,
        },
      ]);
    },
  });
  useTRPCErrorHandler(error);
  return (
    <>
      <LoadingCard
        isLoading={isFetching}
        className="min-h-[400px] min-w-[500px] bg-base-100 shadow-lg"
      >
        <Card.Body className="px-2">
          <Card.Title className="mb-5 justify-center" tag="h2">
            {username !== undefined ? `${username}'s Flights` : 'My Flights'}
          </Card.Title>
          <Table
            className="text-sm"
            columns={[
              {
                id: 'outTime',
                accessorKey: 'outTime',
                header: () => 'Date',
                cell: ({ getValue }) => {
                  const isoTime = getValue<string>();
                  const date = format(new Date(isoTime), DATE_FORMAT);
                  const color = isBefore(new Date(isoTime), new Date())
                    ? 'info'
                    : 'secondary';
                  return (
                    <Badge size="sm" className="font-semibold" color={color}>
                      {date}
                    </Badge>
                  );
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
                    <div className="flex w-[100px] justify-center">
                      <img
                        className="max-h-[50px] max-w-[100px]"
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
                header: () => 'Dep',
                cell: ({ row, getValue }) => {
                  const airportData = getValue<airport>();
                  const outTime = row.original.outTime;
                  const departureTime = format(new Date(outTime), 'h:mm a');
                  return (
                    <div>
                      <div className="text-base font-bold">
                        {airportData?.id}
                      </div>
                      <div className="truncate text-xs opacity-50">
                        {airportData?.municipality}
                      </div>
                      <div className="font-mono text-xs font-bold opacity-50">
                        {departureTime}
                      </div>
                    </div>
                  );
                },
                footer: () => null,
              },
              {
                id: 'arrivalAirport',
                accessorKey: 'arrivalAirport',
                header: () => 'Arr',
                cell: ({ row, getValue }) => {
                  const airportData = getValue<airport>();
                  const inTime = row.original.inTime;
                  const arrivalTime = format(new Date(inTime), 'h:mm a');
                  return (
                    <div>
                      <div className="text-base font-bold">
                        {airportData?.id}
                      </div>
                      <div className="truncate text-xs opacity-50">
                        {airportData?.municipality}
                      </div>
                      <div className="font-mono text-xs font-bold opacity-50">
                        {arrivalTime}
                      </div>
                    </div>
                  );
                },
                footer: () => null,
              },
              {
                id: 'duration',
                accessorKey: 'duration',
                header: () => 'Duration',
                cell: ({ getValue }) => {
                  const duration = getValue<string>();
                  return <div className="font-mono">{duration}</div>;
                },
              },
              {
                id: 'flightNumber',
                accessorKey: 'flightNumber',
                header: () => 'Flight #',
                cell: ({ getValue, row }) => {
                  const airlineData = row.getValue<airline>('airline');
                  const flightNumber = getValue<number | null>();
                  return (
                    <div className="opacity-70">
                      {`${airlineData?.iata ?? ''} ${
                        flightNumber ?? ''
                      }`.trim()}
                    </div>
                  );
                },
                footer: () => null,
              },
              {
                id: 'aircraftType',
                accessorKey: 'aircraftType',
                header: () => 'Aircraft',
                cell: ({ getValue }) => {
                  const aircraftType = getValue<aircraft_type>();
                  return (
                    <div className="truncate italic opacity-70">
                      {aircraftType?.name ?? ''}
                    </div>
                  );
                },
                footer: () => null,
              },
              {
                id: 'tailNumber',
                accessorKey: 'tailNumber',
                header: () => 'Tail #',
                cell: ({ getValue }) => {
                  const tailNumber = getValue<string>();
                  return <div className="font-mono">{tailNumber}</div>;
                },
                footer: () => null,
              },
              {
                id: 'actions',
                header: () => 'Actions',
                cell: ({ row }) => (
                  <div className="flex gap-1">
                    <Button
                      className="px-1"
                      color="ghost"
                      startIcon={<LinkIcon />}
                      size="xs"
                    />
                    <Button
                      className="px-1"
                      color="info"
                      startIcon={<ViewIcon className="h-4 w-4" />}
                      size="xs"
                    />
                    {username === undefined ? (
                      <>
                        <Button
                          className="px-1"
                          color="warning"
                          startIcon={<EditIcon />}
                          size="xs"
                        />
                        <Button
                          onClick={() => {
                            setDeleteFlightData({
                              departureAirportId:
                                row.original.departureAirportId,
                              arrivalAirportId: row.original.arrivalAirportId,
                              id: row.original.id,
                            });
                            setIsDeleteDialogOpen(true);
                          }}
                          className="px-1"
                          color="error"
                          startIcon={<TrashIcon />}
                          size="xs"
                        />
                      </>
                    ) : null}
                  </div>
                ),
                footer: () => null,
              },
            ]}
            cellClassNames={{
              outTime: 'w-[120px]',
              airline: 'w-[135px] hidden md:table-cell',
              duration: 'w-[100px] hidden xl:table-cell',
              flightNumber: 'w-[120px] hidden lg:table-cell',
              aircraftType: 'hidden lg:table-cell',
              tailNumber: 'w-[100px] hidden xl:table-cell',
              actions: 'w-[150px]',
            }}
            data={data ?? []}
            enableFixedWidth
            enableSorting={false}
            getCoreRowModel={getCoreRowModel()}
          />
        </Card.Body>
      </LoadingCard>
      <Modal
        actionButtons={[
          {
            children: 'Cancel',
            color: 'ghost',
            onClick: () => setIsDeleteDialogOpen(false),
          },
          {
            children: 'Yes',
            color: 'error',
            loading: isLoading,
            onClick: () =>
              deleteFlightData !== null && mutate({ id: deleteFlightData.id }),
          },
        ]}
        onClose={() => setIsDeleteDialogOpen(false)}
        show={isDeleteDialogOpen}
        title="Delete Flight"
      >
        Are you sure you want to delete your{' '}
        <strong>
          {deleteFlightData?.departureAirportId ?? ''} -{' '}
          {deleteFlightData?.arrivalAirportId ?? ''}
        </strong>{' '}
        flight?
      </Modal>
    </>
  );
};
