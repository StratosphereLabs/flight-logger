import classNames from 'classnames';
import { useMemo, type HTMLProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Link } from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import {
  FlightChangelogTable,
  FlightTimesDisplay,
} from '../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
  TEXT_COLORS,
} from '../../common/constants';
import { AppTheme, useIsDarkMode, useThemeStore } from '../../stores';

export interface FlightRowProps extends HTMLProps<HTMLDivElement> {
  flight: FlightsRouterOutput['getFollowingFlights']['flights'][number];
  onFlightClick: () => void;
  onFlightClose: () => void;
  selectedFlightId: string | null;
}

export const FlightRow = ({
  className,
  flight,
  onFlightClick,
  onFlightClose,
  selectedFlightId,
  ...props
}: FlightRowProps): JSX.Element => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDarkMode = useIsDarkMode();
  const isActive = useMemo(
    () => flight.id === selectedFlightId,
    [flight.id, selectedFlightId],
  );
  const arrivalMunicipality =
    flight.diversionAirport?.municipality ?? flight.arrivalAirport.municipality;
  const arrivalCountryId =
    flight.diversionAirport?.countryId ?? flight.arrivalAirport.countryId;
  const arrivalRegionName =
    flight.diversionAirport?.region.name ?? flight.arrivalAirport.region.name;
  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-2 rounded-box border-2 p-1 transition-shadow transition-transform',
        !isActive && 'hover:scale-[1.01]',
        !isActive &&
          (isDarkMode
            ? 'hover:shadow-[0_0px_15px_0_rgba(255,255,255,0.50)]'
            : 'hover:shadow-[0_0px_15px_0_rgba(0,0,0,0.25)]'),
        theme === AppTheme.LOFI
          ? CARD_COLORS_LOFI[flight.delayStatus]
          : CARD_COLORS[flight.delayStatus],
        theme === AppTheme.LOFI
          ? CARD_BORDER_COLORS_LOFI[flight.delayStatus]
          : CARD_BORDER_COLORS[flight.delayStatus],
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
            if (isActive) {
              onFlightClose();
            } else {
              onFlightClick();
            }
          }
        }}
        {...props}
      >
        <div className="flex h-full w-[100px] flex-col gap-2 overflow-hidden sm:w-[145px] lg:w-auto">
          <div className="flex w-full flex-1 flex-col gap-x-3 lg:flex-row">
            <div className="flex h-[20px] w-[100px]">
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
            <div className="flex flex-col items-start gap-x-3 text-xs opacity-80 sm:flex-row sm:items-center lg:text-sm">
              <Link
                className="w-[50px] text-nowrap font-mono lg:w-[60px]"
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
              <div className="w-[80px] text-nowrap text-xs font-semibold opacity-80">
                {flight.outDateLocalAbbreviated}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 overflow-hidden">
            <Avatar shapeClassName="w-4 h-4 lg:w-6 lg:h-6 rounded-full">
              <img alt={flight.user.username} src={flight.user.avatar} />
            </Avatar>
            <Link
              hover
              onClick={() => {
                navigate(`/user/${flight.user.username}`);
              }}
              className="truncate text-xs font-semibold opacity-80 lg:text-sm"
            >
              {flight.user.username}
            </Link>
          </div>
        </div>
        <div className="flex flex-[6] gap-2">
          <div className="flex w-0 flex-1 flex-col justify-start">
            <div className="flex flex-col gap-x-3 sm:flex-row sm:items-center">
              <div className="font-mono text-2xl font-bold">
                {flight.departureAirport.iata}
              </div>
              <span className="flex-1 truncate text-xs opacity-75 sm:hidden">
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
            <div className="hidden truncate text-xs opacity-75 sm:block">
              {flight.departureAirport.municipality},{' '}
              {flight.departureAirport.countryId === 'US'
                ? flight.departureAirport.region.name
                : flight.departureAirport.countryId}
            </div>
          </div>
          <div className="flex w-0 flex-1 flex-col justify-start">
            <div className="flex flex-col gap-x-3 sm:flex-row sm:items-center">
              <div className="flex gap-1 font-mono text-2xl font-bold">
                <span
                  className={classNames(
                    flight.diversionAirport !== null &&
                      'text-lg line-through opacity-50',
                  )}
                >
                  {flight.arrivalAirport.iata}
                </span>
                {flight.diversionAirport !== null ? (
                  <span>{flight.diversionAirport.iata}</span>
                ) : null}
              </div>
              <div className="w-full truncate text-xs opacity-75 sm:hidden">
                {arrivalMunicipality}
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
            <div className="hidden truncate text-xs opacity-75 sm:block">
              {arrivalMunicipality},{' '}
              {arrivalCountryId === 'US' ? arrivalRegionName : arrivalCountryId}
            </div>
          </div>
        </div>
        <div className="flex h-full min-w-[65px] flex-[2] flex-col items-end justify-between text-xs">
          <div
            className={classNames(
              'flex flex-col flex-nowrap items-end gap-x-1 text-right',
              flight.delayStatus !== 'none' && 'font-semibold',
              TEXT_COLORS[flight.delayStatus],
              [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                'brightness-90',
            )}
          >
            <span>{flight.flightStatus}</span>
            <span className="flex flex-wrap justify-end gap-x-1">
              {flight.flightRadarStatus === 'CANCELED' ? (
                'Canceled'
              ) : (
                <>
                  {flight.delayStatus !== 'none' ? (
                    <>
                      Delayed{' '}
                      <span className="text-nowrap">{flight.delay}</span>
                    </>
                  ) : (
                    'On Time'
                  )}
                </>
              )}
            </span>
          </div>
          <div className="flex flex-wrap-reverse justify-end gap-x-4">
            {flight.tailNumber !== null && flight.tailNumber.length > 0 ? (
              <a
                className="link-hover link pt-[1px] font-mono font-semibold"
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
              <div className="opacity-75">{flight.aircraftType.icao}</div>
            ) : null}
          </div>
        </div>
      </div>
      {isActive ? <FlightChangelogTable flightId={flight.id} /> : null}
    </div>
  );
};
