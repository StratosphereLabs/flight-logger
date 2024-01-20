import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { Card, CardBody, Link } from 'stratosphere-ui';
import { PlaneSolidIcon } from '../../common/components';
import { useProfilePage } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

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
    <Card className="card-compact bg-base-200 shadow-md sm:card-normal">
      <CardBody className="gap-0">
        <div className="mb-3 flex w-full justify-between gap-3 text-xs sm:text-sm">
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
          <div className="flex flex-wrap items-center justify-end font-semibold">
            <div className="opacity-75">{data.aircraftType?.name}</div>
            {data.tailNumber !== null && data.tailNumber.length > 0 ? (
              <Link
                className="ml-3 pt-[1px] font-mono"
                hover
                href={`https://www.flightaware.com/resources/registration/${data.tailNumber}`}
                target="_blank"
              >
                {data.tailNumber}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 font-mono text-xl font-semibold">
          <div>{data.departureAirport.iata}</div>
          <div className="relative h-full flex-1">
            <div className="absolute left-0 top-0 flex h-full w-full items-center px-2 opacity-50">
              <progress
                className="progress progress-primary left-0 top-0 flex-1"
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
                  className="absolute right-0 h-10 w-10 text-success"
                  style={{
                    transform: 'translate(41%, -15%)',
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
              <div
                className={classNames(
                  data.outTimeActualLocal !== null
                    ? 'mr-2 text-xs line-through'
                    : 'text-xs sm:text-sm',
                )}
              >
                {data.outTimeLocal}
              </div>
              {data.outTimeActualLocal !== null &&
              data.outTimeActualDaysAdded !== null ? (
                <div
                  className={classNames(
                    'text-xs font-bold sm:text-sm',
                    data.departureDelayValue !== null &&
                      data.departureDelayValue > 45
                      ? 'text-error'
                      : 'text-green-600',
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
          <div className="flex flex-1 items-center justify-center text-center text-xs italic sm:items-start sm:text-sm">
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
              {data.inTimeActualLocal !== null &&
              data.inTimeActualDaysAdded !== null ? (
                <div
                  className={classNames(
                    'ml-2 text-xs font-bold sm:text-sm',
                    data.arrivalDelayValue !== null &&
                      data.arrivalDelayValue > 45
                      ? 'text-error'
                      : 'text-green-600',
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
