import { useNavigate } from '@tanstack/react-router';
import classNames from 'classnames';
import { formatDistanceToNowStrict, isBefore } from 'date-fns';
import { Avatar, Button, Link, Loading } from 'stratosphere-ui';

import {
  FlightTimesDisplay,
  PlusAirplaneIcon,
  RightArrowIcon,
  UserPlusIcon,
} from '.';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import {
  AppTheme,
  getIsLoggedIn,
  useAuthStore,
  useThemeStore,
} from '../../stores';
import { TEXT_COLORS } from '../constants';
import { useProfileUserQuery } from '../hooks';

export interface FlightInfoProps {
  data?: Pick<
    FlightsRouterOutput['getFlight'],
    | 'user'
    | 'userId'
    | 'canAddFlight'
    | 'airline'
    | 'flightNumber'
    | 'outDateLocal'
    | 'otherTravelers'
    | 'departureAirport'
    | 'departureMunicipalityText'
    | 'departureDelayStatus'
    | 'outTimeActualValue'
    | 'outTimeValue'
    | 'outTimeActualLocal'
    | 'outTimeLocal'
    | 'outTimeActualDaysAdded'
    | 'arrivalAirport'
    | 'arrivalMunicipalityText'
    | 'arrivalDelayStatus'
    | 'inTimeActualValue'
    | 'inTimeValue'
    | 'inTimeActualLocal'
    | 'inTimeLocal'
    | 'inTimeActualDaysAdded'
    | 'inTimeDaysAdded'
    | 'diversionAirport'
    | 'departureGate'
    | 'departureTerminal'
    | 'arrivalGate'
    | 'arrivalTerminal'
    | 'durationString'
    | 'distance'
    | 'delayStatus'
    | 'flightProgress'
    | 'delay'
    | 'progress'
    | 'outTimeActual'
    | 'outTime'
    | 'durationToTakeoffString'
    | 'durationToLandingString'
    | 'durationToArrivalString'
    | 'inTimeActual'
    | 'inTime'
    | 'arrivalBaggage'
  >;
  onAddTravelersClick?: () => void;
  onJoinFlightClick?: () => void;
}

export const FlightInfo = ({
  data,
  onAddTravelersClick,
  onJoinFlightClick,
}: FlightInfoProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data: userData } = useProfileUserQuery();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  if (data === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <div className="mb-2 flex flex-col items-center gap-1 p-1">
      <div className="flex gap-x-3 gap-y-1 md:flex-col md:items-center">
        {typeof data.airline?.logo === 'string' ? (
          <div className="flex h-[45px] w-[120px] items-center justify-center md:h-[75px] md:w-[200px]">
            <img
              alt={`${data.airline.name} Logo`}
              className="max-h-[45px] max-w-[120px] md:max-h-[75px] md:max-w-[200px]"
              src={data.airline.logo}
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col justify-center md:gap-1">
          <div className="text-base font-bold opacity-90 md:text-center md:text-lg">
            {data.airline?.name} {data.flightNumber}
          </div>
          <div className="text-xs font-semibold opacity-80 md:text-center md:text-sm">
            {data.outDateLocal}
          </div>
        </div>
      </div>
      {data.user !== null ? (
        <div className="flex h-8 w-full justify-center gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="avatar-group rotate-180 transform -space-x-4">
              {data.otherTravelers.slice(0, 2).map(traveler => (
                <Avatar
                  key={traveler.username}
                  alt={traveler.username}
                  src={traveler.avatar}
                  className="rotate-180 transform"
                  shapeClassName="w-6 rounded-full"
                />
              ))}
              <Avatar
                alt={data.user.username}
                src={data.user.avatar}
                className={classNames(
                  'rotate-180 transform',
                  data.otherTravelers.length === 0 && 'border-none',
                )}
                shapeClassName="w-6 rounded-full"
              />
            </div>
            <Link
              hover
              onClick={() => {
                if (data.user !== null) {
                  void navigate({
                    to: '/user/$username',
                    params: { username: data.user.username },
                  });
                }
              }}
              className="flex gap-2 truncate text-base font-semibold opacity-90"
            >
              {data.user.username}
            </Link>
            {data.otherTravelers.length > 0 ? (
              <span className="font-semibold">
                +{data.otherTravelers.length}
              </span>
            ) : null}
          </div>
          {isLoggedIn &&
          userData?.id === data.userId &&
          onAddTravelersClick !== undefined ? (
            <Button
              className="max-w-[150px] truncate"
              color="ghost"
              onClick={onAddTravelersClick}
              size="sm"
            >
              <span className="w-4">
                <UserPlusIcon className="h-4 w-4" />
              </span>
              <span className="truncate">Add Travelers</span>
            </Button>
          ) : null}
          {isLoggedIn &&
          data.canAddFlight &&
          onJoinFlightClick !== undefined ? (
            <Button
              className="max-w-[150px] truncate"
              color="ghost"
              onClick={onJoinFlightClick}
              size="sm"
            >
              <span className="w-4">
                <PlusAirplaneIcon className="h-4 w-4" />
              </span>
              <span className="truncate">
                Join {data.user.firstName ?? `@${data.user.username}`}
              </span>
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="mt-1 flex w-full flex-col gap-2">
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
              {data.arrivalAirport.municipality},{' '}
              {data.arrivalAirport.countryId === 'US' ||
              data.arrivalAirport.countryId === 'CA'
                ? data.arrivalAirport.regionId.split('-')[1]
                : data.arrivalAirport.countryId}
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
              [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
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
              [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
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
        <div className="flex justify-center text-sm italic opacity-80">
          {data.durationString} ({data.distance.toLocaleString()} miles)
        </div>
        <div className="flex flex-col gap-1 md:gap-2">
          <div
            className={classNames(
              'flex justify-center gap-3',
              data.delayStatus !== 'none' && 'font-semibold',
              TEXT_COLORS[data.delayStatus],
              [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
            )}
          >
            <span>
              {data.diversionAirport !== null
                ? `${
                    isBefore(new Date(), data.inTimeActual ?? data.inTime)
                      ? 'Diverting'
                      : 'Diverted'
                  } to ${data.diversionAirport.iata}`
                : data.delayStatus === 'canceled'
                  ? 'Canceled'
                  : data.delayStatus !== 'none'
                    ? `Delayed ${data.delay}`
                    : 'On Time'}
            </span>
            <span>
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
            </span>
          </div>
          {data.arrivalBaggage !== null ? (
            <div
              className={classNames(
                'text-center text-sm font-semibold md:text-base',
                TEXT_COLORS[data.arrivalDelayStatus],
                [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
              )}
            >
              Baggage Claim {data.arrivalBaggage}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
