import { type AircraftType } from '@prisma/client';
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
          cell: ({ getValue, row }) => {
            const date = getValue<string>();
            return (
              <div className="flex flex-col gap-2">
                <div className="flex h-[24px] w-[120px]">
                  {row.original.airline?.logo !== null &&
                  row.original.airline?.logo !== undefined ? (
                    <a
                      className="flex flex-1 items-center"
                      href={row.original.airline.wiki ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        alt={`${row.original.airline.name} Logo`}
                        className="max-h-full max-w-full"
                        src={row.original.airline.logo}
                      />
                    </a>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 flex-col items-start gap-x-3 gap-y-1 sm:flex-row sm:items-center">
                    <Badge
                      className="badge-md font-normal text-white opacity-80"
                      color={
                        typeof dateBadgeColor === 'function'
                          ? dateBadgeColor(row.original)
                          : dateBadgeColor
                      }
                    >
                      {date.split('-')[0]}
                    </Badge>
                    <div className="text-nowrap text-xs font-semibold opacity-60 sm:text-sm">
                      {row.original.outDateLocalAbbreviated}
                    </div>
                  </div>
                  <div className="flex w-[46px] sm:w-[62px]">
                    <div className="flex gap-1 font-mono text-sm opacity-75 sm:text-base">
                      <span className="opacity-90">
                        {row.original.airline?.iata}
                      </span>
                      <span className="font-semibold">
                        {row.original.flightNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          },
          footer: () => null,
        },
        {
          id: 'departureAirport',
          accessorKey: 'departureAirport',
          cell: ({ row, getValue }) => {
            const airportData =
              getValue<
                FlightsRouterOutput['getUserFlights']['results'][number]['departureAirport']
              >();
            return (
              <div className="flex h-full flex-col">
                <div className="font-mono text-2xl font-bold">
                  {airportData?.iata}{' '}
                </div>
                <div className="truncate text-sm opacity-90">
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
          cell: ({ row, getValue }) => {
            const airportData =
              getValue<
                FlightsRouterOutput['getUserFlights']['results'][number]['arrivalAirport']
              >();
            const arrivalMunicipality =
              row.original.diversionAirport?.municipality ??
              airportData.municipality;
            const arrivalCountryId =
              row.original.diversionAirport?.countryId ?? airportData.countryId;
            const arrivalRegionName =
              row.original.diversionAirport?.region.name ??
              airportData.region.name;
            return (
              <div className="flex h-full flex-col">
                <div className="flex gap-1 font-mono text-2xl font-bold">
                  <span
                    className={classNames(
                      row.original.diversionAirport !== null &&
                        'text-xl line-through opacity-50',
                    )}
                  >
                    {airportData?.iata}
                  </span>
                  {row.original.diversionAirport !== null ? (
                    <span>{row.original.diversionAirport.iata}</span>
                  ) : null}
                </div>
                <div className="truncate text-sm opacity-90">
                  {arrivalMunicipality},{' '}
                  {arrivalCountryId === 'US'
                    ? arrivalRegionName
                    : arrivalCountryId}
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
          cell: ({ getValue }) => {
            const duration = getValue<string>();
            return <div className="font-mono text-sm">{duration}</div>;
          },
        },
        {
          id: 'aircraftType',
          accessorKey: 'aircraftType',
          cell: ({ getValue, row }) => {
            const aircraftType = getValue<AircraftType>();
            return (
              <div className="flex flex-col gap-1 truncate text-sm">
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
        outDateISO: 'h-[inherit] w-[150px] sm:w-[250px]',
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
      hideHeader
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
