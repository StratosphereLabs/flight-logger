import { type aircraft_type } from '@prisma/client';
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
  data?: FlightsRouterOutput['getUserFlights']['results'];
  dateBadgeColor?:
    | ((
        flight: FlightsRouterOutput['getUserFlights']['results'][number],
      ) => BadgeColor)
    | BadgeColor;
  enableRowSelection?: RowSelectionOptions<
    FlightsRouterOutput['getUserFlights']['results'][number]
  >['enableRowSelection'];
  onCopyLink?: (
    flight: FlightsRouterOutput['getUserFlights']['results'][number],
  ) => void;
  size?: TableSize;
}

export type FlightsTableRow = Row<
  FlightsRouterOutput['getUserFlights']['results'][number]
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
                  className="badge-sm font-normal text-white opacity-80 sm:badge-md"
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
          id: 'flightNumber',
          accessorKey: 'flightNumber',
          header: () => 'Flight #',
          cell: ({ getValue, row }) => {
            const flightNumber = getValue<number | null>();
            return (
              <div className="flex h-full flex-col gap-2">
                {row.original.airline?.logo !== null &&
                row.original.airline?.logo !== undefined ? (
                  <div className="flex w-[60px] flex-1 sm:w-[120px]">
                    <a
                      className="flex flex-1 items-center"
                      href={row.original.airline.wiki ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        alt={`${row.original.airline.name} Logo`}
                        className="max-h-[20px] max-w-[60px] sm:max-h-[30px] sm:max-w-[120px]"
                        src={row.original.airline.logo}
                      />
                    </a>
                  </div>
                ) : null}
                <div className="mb-2 flex gap-1 font-mono text-xs opacity-60 sm:text-sm">
                  <span className="opacity-90">
                    {row.original.airline?.iata}
                  </span>
                  <span className="font-semibold">{flightNumber}</span>
                </div>
              </div>
            );
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
                FlightsRouterOutput['getUserFlights']['results'][number]['departureAirport']
              >();
            return (
              <div className="flex h-full flex-col">
                <div className="font-mono text-lg font-bold">
                  {airportData?.iata}{' '}
                  <span className="hidden text-sm opacity-50 md:inline-block">
                    / {airportData?.id}
                  </span>
                </div>
                <div className="truncate text-xs opacity-75">
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
                FlightsRouterOutput['getUserFlights']['results'][number]['arrivalAirport']
              >();
            return (
              <div className="flex h-full flex-col">
                <div className="font-mono text-lg font-bold">
                  {airportData?.iata}{' '}
                  <span className="hidden text-sm opacity-50 md:inline-block">
                    / {airportData?.id}
                  </span>
                </div>
                <div className="truncate text-xs opacity-75">
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
          id: 'aircraftType',
          accessorKey: 'aircraftType',
          header: () => 'Aircraft',
          cell: ({ getValue, row }) => {
            const aircraftType = getValue<aircraft_type>();
            return (
              <div className="flex flex-col gap-1 truncate">
                <div className="truncate italic opacity-70">
                  {aircraftType?.name ?? ''}
                </div>
                <a
                  className="link-hover link pt-[1px] font-mono hover:font-bold hover:no-underline"
                  href={
                    row.original.airframe !== null
                      ? `https://www.planespotters.net/hex/${row.original.airframe.icao24.toUpperCase()}`
                      : `https://www.flightaware.com/resources/registration/${row.original.tailNumber}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {row.original.tailNumber}
                </a>
              </div>
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
        outDateISO: 'px-0 sm:px-1 w-[85px] sm:w-[120px]',
        flightNumber: 'h-[inherit] w-[68px] sm:w-[144px]',
        departureAirport: 'h-[inherit]',
        arrivalAirport: 'h-[inherit]',
        duration: 'w-[100px] hidden lg:table-cell',
        aircraftType: 'hidden sm:table-cell',
        tailNumber: 'w-[100px] hidden lg:table-cell',
        actions: 'px-0 sm:px-1 w-[35px] xl:w-[150px]',
      }}
      data={data ?? []}
      enableRowHover={enableRowSelection}
      enableRowSelection={enableRowSelection}
      enableSorting={false}
      getCoreRowModel={getCoreRowModel()}
      highlightWhenSelected
      onRowSelectionChange={setRowSelection}
      rowClassName={row =>
        classNames(
          'table-row',
          theme === AppTheme.LOFI
            ? CARD_COLORS_LOFI[row.original.arrivalDelayStatus]
            : CARD_COLORS[row.original.arrivalDelayStatus],
        )
      }
      size={size}
      state={{ rowSelection }}
    />
  );
};
