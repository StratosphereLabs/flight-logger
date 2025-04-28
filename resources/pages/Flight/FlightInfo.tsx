import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Link, Loading } from 'stratosphere-ui';

import { FlightTimesDisplay, RightArrowIcon } from '../../common/components';
import { TEXT_COLORS } from '../../common/constants';
import { useAircraftPhotoQuery } from '../../common/hooks';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export interface FlightInfoProps {
  flightId: string;
}

export const FlightInfo = ({
  flightId,
}: FlightInfoProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data } = trpc.flights.getFlight.useQuery({ id: flightId });
  const { data: photoData, isFetching } = useAircraftPhotoQuery(
    data?.airframeId ?? null,
  );
  if (data === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  }
  const tailNumber = data.airframe?.registration ?? data.tailNumber ?? null;
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      <div className="flex gap-2 md:flex-col">
        {typeof data.airline?.logo === 'string' ? (
          <div className="flex w-[120px] items-center md:w-[200px]">
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
        <div className="flex justify-center text-sm italic opacity-80">
          {data.durationString} ({data.distance.toLocaleString()} miles)
        </div>
        <div
          className={classNames(
            'flex justify-center gap-3',
            data.delayStatus !== 'none' && 'font-semibold',
            TEXT_COLORS[data.delayStatus],
            [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
              'brightness-90',
          )}
        >
          <span>{data.flightStatusText}</span>
          <span>
            {data.delayStatus === 'canceled'
              ? 'Canceled'
              : data.delayStatus !== 'none'
                ? `Delayed ${data.delay}`
                : 'On Time'}
          </span>
        </div>
      </div>
      <div className="divider my-0" />
      <div className="flex w-full justify-between gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <div className="text-lg font-semibold">{data.aircraftType?.name}</div>
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">ICAO Code</span>
              <Badge color="info" size="md" className="font-mono">
                {data.aircraftType?.icao}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">Tail Number</span>
              {tailNumber !== null ? (
                <span className="font-mono text-base opacity-80">
                  {tailNumber}
                </span>
              ) : (
                <span className="text-sm opacity-80">N/A</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">Hex Code</span>
              {data.airframe !== null ? (
                <span className="font-mono text-sm opacity-80">
                  {data.airframe.icao24}
                </span>
              ) : (
                <span className="text-sm opacity-80">N/A</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-40 flex-col justify-center overflow-hidden">
          {photoData !== undefined ? (
            <img
              src={photoData.photos[0].thumbnail.src}
              alt="Photo unavailable"
              className="rounded-box h-24 w-40 object-cover shadow-sm"
            />
          ) : null}
          {photoData === undefined ? (
            <div className="rounded-box bg-base-100 flex h-24 w-40 items-center justify-center">
              {isFetching ? <Loading /> : 'Photo unavailable'}
            </div>
          ) : null}
          <p className="truncate text-center text-xs opacity-75">
            {photoData?.photos[0].photographer ?? ''}
          </p>
        </div>
      </div>
    </div>
  );
};
