import { aircraft_type, airline, airport } from '@prisma/client';
import { getCoreRowModel } from '@tanstack/react-table';
import { Badge, Progress } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { Table } from 'stratosphere-ui';
import { DeleteFlightModal } from './DeleteFlightModal';
import { EditFlightModal } from './EditFlightModal';
import { useFlightsPageStore } from './flightsPageStore';
import { ViewFlightModal } from './ViewFlightModal';
import { ActionsCell } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface DeleteFlightData {
  departureAirportId: string;
  arrivalAirportId: string;
  id: string;
}

export const Flights = (): JSX.Element => {
  const {
    setActiveFlight,
    setIsDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
  } = useFlightsPageStore();
  const { username } = useParams();
  const { data, error, isFetching, refetch } =
    trpc.users.getUserFlights.useQuery({
      username,
    });
  useTRPCErrorHandler(error);
  return (
    <div className="flex flex-col items-center gap-4">
      <article className="prose">
        <h2>
          {username !== undefined ? `${username}'s Flights` : 'My Flights'}
        </h2>
      </article>
      {isFetching ? (
        <Progress />
      ) : (
        <Table
          className="table-compact xl:table-normal"
          columns={[
            {
              id: 'outDateISO',
              accessorKey: 'outDateISO',
              header: () => 'Date',
              cell: ({ getValue, row }) => {
                const date = getValue<string>();
                return (
                  <Badge
                    className="badge-sm font-semibold xl:badge-md"
                    color={row.original.inFuture ? 'secondary' : 'info'}
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
                      alt={`${airlineData.name} Logo`}
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
                    <div className="text-base font-bold">{airportData?.id}</div>
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
                    <div className="text-base font-bold">{airportData?.id}</div>
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
                  deleteMessage="Delete Flight"
                  editMessage="Edit Flight"
                  viewMessage="View Flight"
                  onDelete={() => {
                    setActiveFlight(row.original);
                    setIsDeleteDialogOpen(true);
                  }}
                  onEdit={() => {
                    setActiveFlight(row.original);
                    setIsEditDialogOpen(true);
                  }}
                  onView={() => {
                    setActiveFlight(row.original);
                    setIsViewDialogOpen(true);
                  }}
                />
              ),
              footer: () => null,
            },
          ]}
          cellClassNames={{
            outDateISO: 'w-[100px] xl:w-[130px]',
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
      )}
      <DeleteFlightModal />
      <EditFlightModal onSuccess={async () => await refetch()} />
      <ViewFlightModal />
    </div>
  );
};
