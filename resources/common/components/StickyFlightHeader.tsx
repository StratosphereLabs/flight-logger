import classNames from 'classnames';
import { Avatar, Link } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { CARD_BORDER_COLORS, CARD_COLORS } from '../constants';
import { FlightTimesDisplay } from './FlightTimesDisplay';
import { RightArrowIcon } from './Icons';

export interface StickyFlightHeaderProps {
  data: FlightsRouterOutput['getFlight'] | undefined;
}

export const StickyFlightHeader = ({
  data,
}: StickyFlightHeaderProps): JSX.Element | null => {
  if (data?.airline === undefined || data?.airline === null) return null;
  return (
    <div className="bg-base-100 sticky top-0 left-0 z-10 w-full shadow-lg">
      <div
        className={classNames(
          'flex justify-between gap-2 border-x-2 p-2',
          CARD_COLORS[data.delayStatus],
          CARD_BORDER_COLORS[data.delayStatus],
        )}
      >
        <div className="flex h-full w-[150px] flex-col overflow-hidden">
          <div className="flex flex-1 gap-4">
            <div className="flex h-[24px] w-[100px]">
              {data.airline.logo !== null ? (
                <a
                  className="flex flex-1 items-center"
                  href={data.airline.wiki ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    alt={`${data.airline.name} Logo`}
                    className="max-h-full max-w-full"
                    src={data.airline.logo}
                  />
                </a>
              ) : null}
            </div>
            <Link
              className="w-[60px] font-mono text-sm text-nowrap opacity-90"
              hover
              href={
                data.flightAwareLink !== null
                  ? `https://www.flightaware.com${data.flightAwareLink}`
                  : `https://www.flightaware.com/live/flight/${data.airline?.icao}${data.flightNumber}`
              }
              target="_blank"
            >
              <span>{data.airline?.iata}</span>{' '}
              <span className="font-semibold">{data.flightNumber}</span>
            </Link>
          </div>
          <div className="text-xs font-semibold opacity-80 md:text-center md:text-sm">
            {data.outDateLocal}
          </div>
          {data.user !== null ? (
            <div className="mt-1 flex items-center gap-1 overflow-hidden">
              <Avatar
                alt={data.user.username}
                src={data.user.avatar}
                shapeClassName="w-4 h-4 rounded-full"
              />
              <span className="truncate text-sm font-semibold opacity-90">
                {data.user.username}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <div className="flex w-0 flex-1 flex-col items-center">
            <div className="font-mono text-xl font-bold">
              {data.departureAirport.iata}
            </div>
            <FlightTimesDisplay
              className="justify-center"
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
          <RightArrowIcon className="h-4 w-4" />
          <div className="flex w-0 flex-1 flex-col items-center">
            <div className="flex gap-1 font-mono text-xl font-bold">
              <span
                className={classNames(
                  data.diversionAirport !== null && 'line-through opacity-60',
                )}
              >
                {data.arrivalAirport.iata}
              </span>
              {data.diversionAirport !== null ? (
                <span>{data.diversionAirport.iata}</span>
              ) : null}
            </div>
            <FlightTimesDisplay
              className="justify-center"
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
      </div>
    </div>
  );
};
