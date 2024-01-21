import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { Card, CardBody, Link } from 'stratosphere-ui';
import { PlaneSolidIcon } from '../../common/components';
import { useProfilePage } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { CARD_COLORS, PROGRESS_BAR_COLORS, TEXT_COLORS } from './constants';

export const CurrentFlightCard = (): JSX.Element | null => {
  const enabled = useProfilePage();
  const { username } = useParams();
  const { data } = trpc.users.getUserCurrentFlight.useQuery(
    {
      username,
    },
    {
      enabled,
      refetchInterval: 60000,
    },
  );
  if (data === null || data === undefined) {
    return null;
  }
  return (
    <Card className={classNames('shadow-md', CARD_COLORS[data.delayStatus])}>
      <CardBody className="gap-0 p-[1rem] sm:p-[1.25rem]">
        <div className="mb-1 flex w-full justify-between gap-3 text-xs sm:text-sm">
          <div className="flex flex-col sm:gap-1">
            <div
              className={classNames(
                'flex',
                data.delayStatus !== 'none' && 'font-semibold',
                TEXT_COLORS[data.delayStatus],
              )}
            >
              {data.delayStatus !== 'none'
                ? `Delayed ${data.delay}`
                : 'On Time'}
            </div>
            <div className="flex items-center gap-4">
              <img
                alt={`${data.airline?.name} Logo`}
                className="max-h-[25px] max-w-[100px]"
                src={data.airline?.logo ?? ''}
              />
              <Link
                className="font-mono"
                hover
                href={`https://www.flightaware.com/live/flight/${data.airline?.icao}${data.flightNumber}`}
                target="_blank"
              >
                {data.airline?.iata} {data.flightNumber}
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="opacity-75">{data.aircraftType?.name}</div>
            {data.tailNumber !== null && data.tailNumber.length > 0 ? (
              <Link
                className="ml-3 pt-[1px] font-mono font-semibold"
                hover
                href={`https://www.flightaware.com/resources/registration/${data.tailNumber}`}
                target="_blank"
              >
                {data.tailNumber}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex h-8 w-full items-center justify-between gap-3 font-mono text-xl font-semibold sm:text-2xl">
          <div>{data.departureAirport.iata}</div>
          <div className="relative h-full flex-1">
            <div className="absolute left-0 top-0 flex h-full w-full items-center px-2 opacity-50">
              <progress
                className={classNames(
                  'progress left-0 top-0 flex-1',
                  PROGRESS_BAR_COLORS[data.delayStatus],
                )}
                value={100 * data.progress}
                max="100"
              />
            </div>
            <div className="absolute left-0 top-0 z-20 h-full w-full px-2">
              <div
                className="relative h-full overflow-visible"
                style={{
                  width: `${100 * data.progress}%`,
                }}
              >
                <PlaneSolidIcon
                  className={classNames(
                    'absolute right-0 h-9 w-9',
                    TEXT_COLORS[data.delayStatus],
                  )}
                  style={{
                    transform: 'translate(42%, -6%)',
                  }}
                />
              </div>
            </div>
            <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-between">
              <div className="h-4 w-4 rounded-full bg-neutral" />
              <div className="h-4 w-4 rounded-full bg-neutral" />
            </div>
          </div>
          <div>{data.arrivalAirport.iata}</div>
        </div>
        <div className="flex w-full justify-between gap-4 opacity-75">
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm">
              {data.departureAirport.municipality},{' '}
              {data.departureAirport.countryId === 'US'
                ? data.departureAirport.region.name
                : data.departureAirport.countryId}
            </div>
            <div className="flex flex-wrap items-center font-mono">
              {data.outTimeActualValue !== data.outTimeValue ? (
                <div
                  className={classNames(
                    data.outTimeActualLocal !== null
                      ? 'mr-2 text-xs line-through'
                      : 'text-xs sm:text-sm',
                  )}
                >
                  {data.outTimeLocal}
                </div>
              ) : null}
              {data.outTimeActualLocal !== null &&
              data.outTimeActualDaysAdded !== null ? (
                <div
                  className={classNames(
                    'text-xs font-bold sm:text-sm',
                    TEXT_COLORS[data.departureDelayStatus],
                  )}
                >
                  {data.outTimeActualLocal}
                  {data.outTimeActualDaysAdded > 0 ? (
                    <sup>+{data.outTimeActualDaysAdded}</sup>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center text-center text-xs italic sm:text-sm">
            {data.progress > 0 && data.progress < 1
              ? `${data.durationToArrivalString} ${
                  data.progress > 0 ? 'remaining' : ''
                }`
              : null}
            {data.progress === 0
              ? `Departs in ${data.durationToDepartureString}`
              : null}
            {data.progress === 1
              ? `Arrived ${data.durationToArrivalString} ago`
              : null}
          </div>
          <div className="flex flex-col">
            <div className="text-right text-xs sm:text-sm">
              {data.arrivalAirport.municipality},{' '}
              {data.arrivalAirport.countryId === 'US'
                ? data.arrivalAirport.region.name
                : data.arrivalAirport.countryId}
            </div>
            <div className="flex flex-wrap items-center justify-end font-mono">
              {data.inTimeActualValue !== data.inTimeValue ? (
                <div
                  className={classNames(
                    data.inTimeActualLocal !== null
                      ? 'text-xs line-through'
                      : 'text-xs sm:text-sm',
                  )}
                >
                  {data.inTimeLocal}
                  {data.inTimeDaysAdded > 0 ? (
                    <sup>+{data.inTimeDaysAdded}</sup>
                  ) : null}
                </div>
              ) : null}
              {data.inTimeActualLocal !== null &&
              data.inTimeActualDaysAdded !== null ? (
                <div
                  className={classNames(
                    'ml-2 text-xs font-bold sm:text-sm',
                    TEXT_COLORS[data.arrivalDelayStatus],
                  )}
                >
                  {data.inTimeActualLocal}
                  {data.inTimeActualDaysAdded > 0 ? (
                    <sup>+{data.inTimeActualDaysAdded}</sup>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
