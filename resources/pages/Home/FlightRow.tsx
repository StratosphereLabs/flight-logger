import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { isAfter, sub } from 'date-fns';
import { type HTMLProps, useMemo } from 'react';
import { Avatar, Link } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { FlightTimesDisplay } from '../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_COLORS,
  TEXT_COLORS,
} from '../../common/constants';
import { AppTheme, useThemeStore } from '../../stores';

export interface FlightRowProps extends HTMLProps<HTMLDivElement> {
  flight: FlightsRouterOutput['getFollowingFlights']['flights'][number];
}

export const FlightRow = ({
  className,
  flight,
  ...props
}: FlightRowProps): JSX.Element => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const shouldUseAircraftLink = useMemo(
    () => isAfter(new Date(), sub(flight.outTime, { days: 2 })),
    [flight.outTime],
  );
  return (
    <div
      className={classNames(
        'rounded-box flex flex-col items-center gap-2 border-2 p-2 transition-transform hover:scale-[1.01]',
        CARD_COLORS[flight.delayStatus],
        CARD_BORDER_COLORS[flight.delayStatus],
        className,
      )}
    >
      <div
        className="flex w-full items-center gap-3 text-sm hover:cursor-pointer lg:gap-4"
        onClick={event => {
          if (
            (event.target as HTMLElement).tagName !== 'A' &&
            (event.target as HTMLElement).parentElement?.tagName !== 'A'
          ) {
            void navigate({
              to: '/flight/$flightId',
              params: { flightId: flight.id },
            });
          }
        }}
        {...props}
      >
        <div className="flex h-full w-[100px] flex-col gap-2 overflow-hidden sm:w-[175px] lg:w-auto">
          <div className="flex flex-1 flex-col gap-x-4 lg:flex-row lg:items-center">
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
            <div className="mt-[2px] flex flex-col items-start gap-x-4 text-sm sm:flex-row sm:items-center lg:text-base">
              <Link
                className="w-[60px] font-mono text-nowrap opacity-90 lg:w-[70px]"
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
              <div className="w-[95px] text-sm font-semibold text-nowrap opacity-80">
                {flight.outDateLocalAbbreviated}
              </div>
            </div>
          </div>
          {flight.user !== null ? (
            <div className="flex items-center gap-1 overflow-hidden sm:gap-2">
              <Avatar
                alt={flight.user.username}
                src={flight.user.avatar}
                shapeClassName="w-4 h-4 sm:w-6 sm:h-6 rounded-full"
              />
              <Link
                hover
                onClick={() =>
                  navigate({
                    to: '/user/$username',
                    params: { username: flight.user?.username ?? '' },
                  })
                }
                className="truncate text-sm font-semibold opacity-90 sm:text-base"
              >
                {flight.user.username}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="flex flex-6 gap-2">
          <div className="flex w-0 flex-1 flex-col justify-start">
            <div className="flex flex-col gap-x-3 sm:flex-row sm:items-center">
              <div className="font-mono text-2xl font-bold">
                {flight.departureAirport.iata}
              </div>
              <span className="flex-1 truncate text-sm sm:hidden">
                {flight.departureMunicipalityText}
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
            <div className="hidden truncate text-sm sm:block">
              {flight.departureMunicipalityText}
            </div>
          </div>
          <div className="flex w-0 flex-1 flex-col justify-start">
            <div className="flex flex-col gap-x-3 sm:flex-row sm:items-center">
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
              <div className="w-full truncate text-sm sm:hidden">
                {flight.arrivalMunicipalityText}
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
            <div className="hidden truncate text-sm sm:block">
              {flight.arrivalMunicipalityText}
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
                onClick={
                  shouldUseAircraftLink
                    ? () =>
                        navigate({
                          to: '/aircraft/$icao24',
                          params: { icao24: flight.airframeId ?? '' },
                        })
                    : undefined
                }
                href={
                  !shouldUseAircraftLink
                    ? flight.airframe !== null
                      ? `https://www.planespotters.net/hex/${flight.airframe.icao24.toUpperCase()}`
                      : `https://www.flightaware.com/resources/registration/${flight.tailNumber}`
                    : undefined
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
  );
};
