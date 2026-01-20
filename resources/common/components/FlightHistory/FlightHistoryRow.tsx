import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { type HTMLProps } from 'react';
import { Avatar, Badge, Link } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../../app/routes/flights';
import { AppTheme, useThemeStore } from '../../../stores';
import { CARD_BORDER_COLORS, CARD_COLORS, TEXT_COLORS } from '../../constants';
import { FlightTimesDisplay } from '../FlightTimesDisplay';

export interface FlightHistoryRowProps extends HTMLProps<HTMLDivElement> {
  flight: FlightsRouterOutput['getFlightHistory']['results'][number];
  previousPageName?: string;
}

export const FlightHistoryRow = ({
  className,
  flight,
  previousPageName,
  ...props
}: FlightHistoryRowProps): JSX.Element => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  return (
    <div className="bg-base-100 rounded-box flex transition-transform hover:scale-[1.01]">
      <div
        className={classNames(
          'rounded-box flex flex-1 flex-col items-center gap-2 border-2 p-2',
          CARD_COLORS[flight.delayStatus],
          CARD_BORDER_COLORS[flight.delayStatus],
          className,
        )}
      >
        <div
          className="flex w-full items-center gap-2 text-sm hover:cursor-pointer"
          onClick={event => {
            if (
              (event.target as HTMLElement).tagName !== 'A' &&
              (event.target as HTMLElement).parentElement?.tagName !== 'A'
            ) {
              void navigate({
                to: `/flight/${flight.id}`,
                params: { flightId: flight.id },
              });
            }
          }}
          {...props}
        >
          <div className="flex h-full w-[102px] flex-col gap-2 overflow-hidden">
            <div className="flex flex-1 flex-col gap-x-4">
              <div className="flex h-[24px] w-[100px]">
                {flight.airline?.logo !== null &&
                flight.airline?.logo !== undefined ? (
                  <a
                    className="flex flex-1 items-center"
                    href={flight.airline.wiki ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      alt={`${flight.airline.name} Logo`}
                      className="max-h-full max-w-full"
                      src={flight.airline.logo}
                    />
                  </a>
                ) : null}
              </div>
              <div className="mt-[2px] flex flex-col items-start gap-x-4 text-sm">
                <Link
                  className="w-[60px] font-mono text-nowrap opacity-90"
                  hover
                  href={
                    flight.flightAwareLink !== null
                      ? `https://www.flightaware.com${flight.flightAwareLink}`
                      : `https://www.flightaware.com/live/flight/${flight.airline?.icao}${flight.flightNumber}`
                  }
                  target="_blank"
                >
                  <span>{flight.airline?.iata}</span>{' '}
                  <span className="font-semibold">{flight.flightNumber}</span>
                </Link>
                <div className="flex items-center gap-1">
                  <Badge
                    className="px-2 text-white"
                    color={
                      flight.outTimeYear === new Date().getFullYear().toString()
                        ? 'info'
                        : 'secondary'
                    }
                    size="sm"
                  >
                    {flight.outTimeYear}
                  </Badge>
                  <div className="text-sm font-semibold text-nowrap opacity-80">
                    {flight.outTimeDate}
                  </div>
                </div>
              </div>
            </div>
            {flight.user !== null ? (
              <div className="flex items-center gap-1 overflow-hidden">
                <Avatar
                  alt={flight.user.username}
                  src={flight.user.avatar}
                  shapeClassName="w-4 h-4 rounded-full"
                />
                <Link
                  hover
                  onClick={() =>
                    navigate({ to: `/user/${flight.user?.username}` })
                  }
                  className="truncate text-sm font-semibold opacity-90"
                >
                  {flight.user.username}
                </Link>
              </div>
            ) : null}
          </div>
          <div className="flex flex-6 gap-1">
            <div className="flex w-0 flex-1 flex-col justify-start">
              <div className="flex flex-col gap-x-3">
                <div className="font-mono text-2xl font-bold">
                  {flight.departureAirport.iata}
                </div>
                <span className="flex-1 truncate text-sm">
                  {flight.departureAirport.municipality}
                </span>
                <FlightTimesDisplay
                  data={{
                    delayStatus: flight.departureDelayStatus,
                    actualValue: flight.outTimeActualValue,
                    value: flight.outTimeValue,
                    actualLocal: flight.outTimeActualLocal,
                    local: flight.outTimeLocal,
                    actualDaysAdded: flight.outTimeActualDaysAdded,
                    daysAdded: 0,
                  }}
                />
              </div>
            </div>
            <div className="flex w-0 flex-1 flex-col justify-start">
              <div className="flex flex-col gap-x-3">
                <div className="flex gap-1 font-mono text-2xl font-bold">
                  <span
                    className={classNames(
                      flight.diversionAirport !== null &&
                        'line-through opacity-60',
                    )}
                  >
                    {flight.arrivalAirport.iata}
                  </span>
                  {flight.diversionAirport !== null ? (
                    <span>{flight.diversionAirport.iata}</span>
                  ) : null}
                </div>
                <div className="w-full truncate text-sm">
                  {flight.arrivalAirport.municipality}
                </div>
                <FlightTimesDisplay
                  data={{
                    delayStatus: flight.arrivalDelayStatus,
                    actualValue: flight.inTimeActualValue,
                    value: flight.inTimeValue,
                    actualLocal: flight.inTimeActualLocal,
                    local: flight.inTimeLocal,
                    actualDaysAdded: flight.inTimeActualDaysAdded,
                    daysAdded: flight.inTimeDaysAdded,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex h-full min-w-[65px] flex-2 flex-col items-end justify-between">
            <div
              className={classNames(
                'flex flex-col flex-nowrap items-end gap-x-1 text-right',
                flight.delayStatus !== 'none' && 'font-semibold',
                TEXT_COLORS[flight.delayStatus],
                [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
              )}
            >
              <span className="text-sm">{flight.flightStatusText}</span>
              <span className="flex justify-end gap-1 text-xs">
                {flight.delayStatus !== 'none' ? (
                  <>
                    Delayed <span className="text-nowrap">{flight.delay}</span>
                  </>
                ) : (
                  'On Time'
                )}
              </span>
            </div>
            <div className="flex flex-wrap-reverse justify-end gap-x-4">
              {flight.tailNumber !== null && flight.tailNumber.length > 0 ? (
                <a
                  className="link link-hover pt-[1px] font-mono font-semibold"
                  href={
                    flight.airframe !== null
                      ? `https://www.planespotters.net/hex/${flight.airframe.icao24.toUpperCase()}`
                      : `https://www.flightaware.com/resources/registration/${flight.tailNumber}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {flight.tailNumber}
                </a>
              ) : null}
              {flight.aircraftType !== null ? (
                <div className="opacity-80">{flight.aircraftType.icao}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
