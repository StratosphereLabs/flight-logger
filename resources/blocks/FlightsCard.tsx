import { aircraft_type, airline, airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { format, isBefore } from 'date-fns';
import { useState } from 'react';
import { Badge, Card } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { LoadingCard, Table } from 'stratosphere-ui';
import { ActionsCell } from './ActionsCell';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { ViewFlightModal } from './ViewFlightModal';
import { useTRPCErrorHandler } from '../common/hooks';
import { trpc } from '../utils/trpc';
import { UsersRouterOutput } from '../../app/routes/users';

export const DATE_FORMAT = 'yyyy-MM-dd';

export interface DeleteFlightData {
  departureAirportId: string;
  arrivalAirportId: string;
  id: string;
}

export const FlightsCard = (): JSX.Element => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeFlight, setActiveFlight] = useState<
    UsersRouterOutput['getUserFlights'][number] | null
  >(null);
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserFlights.useQuery({
    username,
  });
  useTRPCErrorHandler(error);
  return (
    <>
      <LoadingCard
        isLoading={isFetching}
        className="min-h-[400px] min-w-[375px] bg-base-100 shadow-lg"
      >
        <Card.Body className="px-3">
          <Card.Title className="mb-5 justify-center" tag="h2">
            {username !== undefined ? `${username}'s Flights` : 'My Flights'}
          </Card.Title>
          <Table
            className="table-compact xl:table-normal"
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
                    <Badge
                      className="badge-sm font-semibold xl:badge-md"
                      color={color}
                    >
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
                    <div className="flex w-[110px] justify-center xl:w-[120px]">
                      <img
                        className="max-h-[55px] max-w-[110px] xl:max-w-[120px]"
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
                  return (
                    <div>
                      <div className="text-base font-bold">
                        {airportData?.id}
                      </div>
                      <div className="truncate text-xs opacity-75 xl:text-sm">
                        {airportData?.municipality}
                      </div>
                      <div className="font-mono text-xs font-bold opacity-50 xl:text-sm">
                        {row.original.outTimeLocal}
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
                  return (
                    <div>
                      <div className="text-base font-bold">
                        {airportData?.id}
                      </div>
                      <div className="truncate text-xs opacity-75 xl:text-sm">
                        {airportData?.municipality}
                      </div>
                      <div className="font-mono text-xs font-bold opacity-50 xl:text-sm">
                        {row.original.inTimeLocal}
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
                accessorKey: 'flightNumberString',
                header: () => 'Flight #',
                cell: ({ getValue }) => {
                  const flightNumber = getValue<number | null>();
                  return <div className="opacity-70">{flightNumber}</div>;
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
                header: () => <div className="hidden xl:flex">Actions</div>,
                cell: ({ row }) => (
                  <ActionsCell
                    onDeleteFlight={() => {
                      setActiveFlight(row.original);
                      setIsDeleteDialogOpen(true);
                    }}
                    onEditFlight={() => {
                      setActiveFlight(row.original);
                      setIsEditDialogOpen(true);
                    }}
                    onViewFlight={() => {
                      setActiveFlight(row.original);
                      setIsViewDialogOpen(true);
                    }}
                  />
                ),
                footer: () => null,
              },
            ]}
            cellClassNames={{
              outTime: 'w-[100px] xl:w-[130px]',
              airline: 'w-[135px] hidden sm:table-cell xl:w-[150px]',
              duration: 'w-[100px] hidden lg:table-cell',
              flightNumber: 'w-[100px] hidden md:table-cell xl:w-[120px]',
              aircraftType: 'hidden md:table-cell',
              tailNumber: 'w-[100px] hidden lg:table-cell',
              actions: 'w-[50px] xl:w-[150px]',
            }}
            data={data ?? []}
            enableFixedWidth
            enableSorting={false}
            getCoreRowModel={getCoreRowModel()}
          />
        </Card.Body>
      </LoadingCard>
      <DeleteFlightModal
        data={activeFlight}
        onClose={() => setIsDeleteDialogOpen(false)}
        show={isDeleteDialogOpen}
      />
      <EditFlightModal
        data={activeFlight}
        onClose={() => setIsEditDialogOpen(false)}
        show={isEditDialogOpen}
      />
      <ViewFlightModal
        data={activeFlight}
        onClose={() => setIsViewDialogOpen(false)}
        show={isViewDialogOpen}
      />
    </>
  );
};
