import classNames from 'classnames';
import { formatDistanceToNowStrict } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Avatar, Link, Loading } from 'stratosphere-ui';

import { FlightTimesDisplay, RightArrowIcon } from '../../common/components';
import { TEXT_COLORS } from '../../common/constants';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { FlightAircraftDetails } from './FlightAircraftDetails';
import { FlightDetailedTimetable } from './FlightDetailedTimetable';

export interface FlightInfoProps {
  flightId: string;
}

export const FlightInfo = ({
  flightId,
}: FlightInfoProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data } = trpc.flights.getFlight.useQuery({ id: flightId });
  if (data === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      <div className="flex gap-2 md:flex-col">
        {typeof data.airline?.logo === 'string' ? (
          <div className="flex w-[120px] items-center justify-center md:w-[200px]">
            <img
              alt={`${data.airline.name} Logo`}
              className="max-h-[50px] max-w-[120px] md:max-h-[80px] md:max-w-[200px]"
              src={data.airline.logo}
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col md:gap-1">
          <div className="text-base font-bold opacity-90 md:text-center md:text-lg">
            {data.airline?.name} {data.flightNumber}
          </div>
          <div className="text-xs font-semibold opacity-80 md:text-center md:text-sm">
            {data.outDateLocal}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar
          alt={data.user.username}
          src={data.user.avatar}
          shapeClassName="w-6 h-6 rounded-full"
        />
        <Link
          hover
          onClick={() => {
            navigate(`/user/${data.user.username}`);
          }}
          className="truncate text-base font-semibold opacity-90"
        >
          {data.user.username}
        </Link>
      </div>
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="text-center font-mono text-4xl font-bold">
                {data.departureAirport.iata}
              </div>
              <div className="truncate text-center text-sm sm:text-base">
                {data.departureMunicipalityText}
              </div>
              <FlightTimesDisplay
                className="justify-center font-mono"
                data={{
                  delayStatus: data.departureDelayStatus,
                  actualValue: data.outTimeActualValue,
                  value: data.outTimeValue,
                  actualLocal: data.outTimeActualLocal,
                  local: data.outTimeLocal,
                  actualDaysAdded: data.outTimeActualDaysAdded,
                  daysAdded: 0,
                }}
              />
            </div>
            <div className="flex items-center">
              <RightArrowIcon className="h-8 w-8 opacity-80" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="text-center font-mono text-4xl font-bold">
                {data.arrivalAirport.iata}
              </div>
              <div className="truncate text-center text-sm sm:text-base">
                {data.arrivalMunicipalityText}
              </div>
              <FlightTimesDisplay
                className="justify-center font-mono"
                data={{
                  delayStatus: data.arrivalDelayStatus,
                  actualValue: data.inTimeActualValue,
                  value: data.inTimeValue,
                  actualLocal: data.inTimeActualLocal,
                  local: data.inTimeLocal,
                  actualDaysAdded: data.inTimeActualDaysAdded,
                  daysAdded: data.inTimeDaysAdded,
                }}
              />
            </div>
          </div>
          <div className="flex gap-12">
            <div
              className={classNames(
                'flex flex-1 flex-wrap items-center justify-center gap-x-2',
                TEXT_COLORS[data.departureDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.departureGate !== null ? (
                <div className="text-base font-semibold">
                  Gate {data.departureGate}
                </div>
              ) : null}
              {data.departureTerminal !== null ? (
                <div className="text-sm">Terminal {data.departureTerminal}</div>
              ) : null}
            </div>
            <div
              className={classNames(
                'flex flex-1 flex-wrap items-center justify-center gap-x-2',
                TEXT_COLORS[data.arrivalDelayStatus],
                [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                  'brightness-90',
              )}
            >
              {data.arrivalGate !== null ? (
                <div className="text-base font-semibold">
                  Gate {data.arrivalGate}
                </div>
              ) : null}
              {data.arrivalTerminal !== null ? (
                <div className="text-sm">Terminal {data.arrivalTerminal}</div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex justify-center text-sm italic opacity-80">
          {data.durationString} ({data.distance.toLocaleString()} miles)
        </div>
        <div
          className={classNames(
            'flex flex-col gap-2',
            data.delayStatus !== 'none' && 'font-semibold',
            TEXT_COLORS[data.delayStatus],
            [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
              'brightness-90',
          )}
        >
          <div className="flex justify-center gap-3">
            <span>{data.flightStatusText}</span>
            <span>
              {data.delayStatus === 'canceled'
                ? 'Canceled'
                : data.delayStatus !== 'none'
                  ? `Delayed ${data.delay}`
                  : 'On Time'}
            </span>
          </div>
          <div className="flex justify-center text-sm">
            {data.flightProgress === 0 && data.progress === 0
              ? `Departs in ${formatDistanceToNowStrict(data.outTimeActual ?? data.outTime)}`
              : null}
            {data.progress > 0 && data.flightProgress === 0
              ? `Taking off in ${data.durationToTakeoffString}`
              : null}
            {data.flightProgress > 0 && data.flightProgress < 1
              ? `Landing in ${data.durationToLandingString}`
              : null}
            {data.flightProgress === 1 && data.progress < 1
              ? `Arriving in ${data.durationToArrivalString}`
              : null}
            {data.flightProgress === 1 && data.progress === 1
              ? `Arrived ${formatDistanceToNowStrict(data.inTimeActual ?? data.inTime)} ago`
              : null}
          </div>
        </div>
      </div>
      <div className="divider my-0" />
      <FlightAircraftDetails data={data} />
      <div className="divider my-0" />
      <FlightDetailedTimetable data={data} />
    </div>
  );
};
