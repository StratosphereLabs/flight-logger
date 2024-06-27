import { type aircraft_type, type airline } from '@prisma/client';
import {
  type Row,
  type RowSelectionOptions,
  getCoreRowModel,
} from '@tanstack/react-table';
import classNames from 'classnames';
import { Badge, type BadgeColor, Table, type TableSize } from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { useFlightsPageStore } from '../../pages/Flights/flightsPageStore';
import { AppTheme, useThemeStore } from '../../stores';
import { CARD_COLORS, CARD_COLORS_LOFI } from '../constants';
import { ActionsCell } from './ActionsCell';
import { FlightTimesDisplay } from './FlightTimesDisplay';

export interface UserFlightsTableProps {
  className?: string;
  data?: FlightsRouterOutput['getUserFlights']['upcomingFlights'];
  dateBadgeColor?:
    | ((
        flight: FlightsRouterOutput['getUserFlights']['upcomingFlights'][number],
      ) => BadgeColor)
    | BadgeColor;
  enableRowSelection?: RowSelectionOptions<
    FlightsRouterOutput['getUserFlights']['upcomingFlights'][number]
  >['enableRowSelection'];
  onCopyLink?: (
    flight: FlightsRouterOutput['getUserFlights']['upcomingFlights'][number],
  ) => void;
  size?: TableSize;
}

export type FlightsTableRow = Row<
  FlightsRouterOutput['getUserFlights']['upcomingFlights'][number]
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
  const { theme } = useThemeStore();
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
              <div className="flex flex-col items-center gap-1">
                <Badge
                  className="badge-md font-normal text-white opacity-80 lg:badge-lg"
                  color={
                    typeof dateBadgeColor === 'function'
                      ? dateBadgeColor(row.original)
                      : dateBadgeColor
                  }
                >
                  {date.split('-')[0]}
                </Badge>
                <div className="text-nowrap text-xs font-semibold opacity-60">
                  {row.original.outDateLocalAbbreviated}
                </div>
              </div>
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
                <a
                  className="flex flex-1 items-center"
                  href={airlineData.wiki ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    alt={`${airlineData.name} Logo`}
                    className="max-h-[55px] max-w-[110px] xl:max-w-[120px]"
                    src={airlineData.logo}
                  />
                </a>
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
            const airportData =
              getValue<
                FlightsRouterOutput['getUserFlights']['upcomingFlights'][number]['departureAirport']
              >();
            return (
              <div>
                <div className="font-mono text-lg font-bold">
                  {airportData?.iata}{' '}
                  <span className="hidden text-sm opacity-50 md:inline-block">
                    / {airportData?.id}
                  </span>
                </div>
                <div className="truncate text-xs opacity-75 xl:text-sm">
                  {airportData.municipality},{' '}
                  {airportData.countryId === 'US'
                    ? airportData.region.name
                    : airportData.countryId}
                </div>
                <FlightTimesDisplay
                  className="font-mono font-bold"
                  data={{
                    delayStatus: row.original.departureDelayStatus,
                    actualValue: row.original.outTimeActualValue,
                    value: row.original.outTimeValue,
                    actualLocal: row.original.outTimeActualLocal,
                    local: row.original.outTimeLocal,
                    actualDaysAdded: row.original.outTimeActualDaysAdded,
                    daysAdded: 0,
                  }}
                />
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
            const airportData =
              getValue<
                FlightsRouterOutput['getUserFlights']['upcomingFlights'][number]['arrivalAirport']
              >();
            return (
              <div>
                <div className="font-mono text-lg font-bold">
                  {airportData?.iata}{' '}
                  <span className="hidden text-sm opacity-50 md:inline-block">
                    / {airportData?.id}
                  </span>
                </div>
                <div className="truncate text-xs opacity-75 xl:text-sm">
                  {airportData.municipality},{' '}
                  {airportData.countryId === 'US'
                    ? airportData.region.name
                    : airportData.countryId}
                </div>
                <FlightTimesDisplay
                  className="font-mono font-bold"
                  data={{
                    delayStatus: row.original.arrivalDelayStatus,
                    actualValue: row.original.inTimeActualValue,
                    value: row.original.inTimeValue,
                    actualLocal: row.original.inTimeActualLocal,
                    local: row.original.inTimeLocal,
                    actualDaysAdded: row.original.inTimeActualDaysAdded,
                    daysAdded: row.original.inTimeDaysAdded,
                  }}
                />
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
          cell: ({ getValue, row }) => {
            const tailNumber = getValue<string>();
            return (
              <a
                className="link-hover link pt-[1px] font-mono hover:font-bold hover:no-underline"
                href={
                  row.original.airframe !== null
                    ? `https://www.planespotters.net/hex/${row.original.airframe.icao24.toUpperCase()}`
                    : `https://www.flightaware.com/resources/registration/${tailNumber}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {tailNumber}
              </a>
            );
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
      rowClassName={row =>
        theme === AppTheme.LOFI
          ? CARD_COLORS_LOFI[row.original.arrivalDelayStatus]
          : CARD_COLORS[row.original.arrivalDelayStatus]
      }
      size={size}
      state={{ rowSelection }}
    />
  );
};
