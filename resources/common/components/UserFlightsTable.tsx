import { type aircraft_type, type airline, type airport } from '@prisma/client';
import {
  type Row,
  type RowSelectionOptions,
  getCoreRowModel,
} from '@tanstack/react-table';
import classNames from 'classnames';
import { Badge, type BadgeColor, Table, type TableSize } from 'stratosphere-ui';
import { type UsersRouterOutput } from '../../../app/routes/users';
import { useFlightsPageStore } from '../../pages/Flights/flightsPageStore';
import { ActionsCell } from './ActionsCell';

export interface UserFlightsTableProps {
  className?: string;
  data?: UsersRouterOutput['getUserFlights']['upcomingFlights'];
  dateBadgeColor?:
    | ((
        flight: UsersRouterOutput['getUserFlights']['upcomingFlights'][number],
      ) => BadgeColor)
    | BadgeColor;
  enableRowSelection?: RowSelectionOptions<
    UsersRouterOutput['getUserFlights']['upcomingFlights'][number]
  >['enableRowSelection'];
  onCopyLink?: (
    flight: UsersRouterOutput['getUserFlights']['upcomingFlights'][number],
  ) => void;
  size?: TableSize;
}

export type FlightsTableRow = Row<
  UsersRouterOutput['getUserFlights']['upcomingFlights'][number]
>;

export const UserFlightsTable = ({
  className,
  data,
  dateBadgeColor,
  enableRowSelection,
  onCopyLink,
  size,
}: UserFlightsTableProps): JSX.Element => {
  const {
    rowSelection,
    setActiveFlight,
    setIsDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
    setRowSelection,
  } = useFlightsPageStore();
  return (
    <Table
      className={classNames('table-fixed', className)}
      columns={[
        {
          id: 'outDateISO',
          accessorKey: 'outDateISO',
          header: () => 'Date',
          cell: ({ getValue, row }) => {
            const date = getValue<string>();
            return (
              <Badge
                className="badge-xs font-normal opacity-80 lg:badge-sm lg:font-semibold"
                color={
                  typeof dateBadgeColor === 'function'
                    ? dateBadgeColor(row.original)
                    : dateBadgeColor
                }
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
                  {row.original.inTimeDaysAdded > 0 ? (
                    <sup>+{row.original.inTimeDaysAdded}</sup>
                  ) : null}
                </div>
              </div>
            );
          },
          footer: () => null,
        },
        {
          id: 'duration',
          accessorKey: 'durationString',
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
              onCopyLink={() => onCopyLink?.(row.original)}
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
        outDateISO: 'w-[100px] lg:w-[120px]',
        airline: 'w-[135px] hidden sm:table-cell xl:w-[150px]',
        duration: 'w-[100px] hidden lg:table-cell',
        flightNumber: 'w-[100px] hidden md:table-cell xl:w-[120px]',
        aircraftType: 'hidden md:table-cell',
        tailNumber: 'w-[100px] hidden lg:table-cell',
        actions: 'w-[50px] xl:w-[150px]',
      }}
      data={data ?? []}
      enableRowHover={enableRowSelection}
      enableRowSelection={enableRowSelection}
      enableSorting={false}
      getCoreRowModel={getCoreRowModel()}
      highlightWhenSelected
      onRowSelectionChange={setRowSelection}
      size={size}
      state={{ rowSelection }}
    />
  );
};
