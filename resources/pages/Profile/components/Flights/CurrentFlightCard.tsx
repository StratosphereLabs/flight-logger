import classNames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, CardBody, Link, Modal, Progress } from 'stratosphere-ui';
import { PlaneSolidIcon } from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useProfilePage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { AppTheme, useThemeStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';
import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
  PROGRESS_BAR_COLORS,
  TEXT_COLORS,
} from './constants';

export const CurrentFlightCard = (): JSX.Element | null => {
  const utils = trpc.useUtils();
  const enabled = useProfilePage();
  const { username } = useParams();
  const { theme } = useThemeStore();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const [isDeleteFlightModalOpen, setIsDeleteFlightModalOpen] = useState(false);
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data, isLoading } = trpc.users.getUserCurrentFlight.useQuery(
    {
      username,
    },
    {
      enabled,
      refetchInterval: 60000,
      onError,
    },
  );
  const { mutate, isLoading: isDeleteFlightLoading } =
    trpc.flights.deleteFlight.useMutation({
      onSuccess: async () => {
        handleSuccess('Flight Deleted');
        setIsDeleteFlightModalOpen(false);
        await utils.users.getUserCurrentFlight.invalidate();
        await utils.statistics.getCounts.invalidate();
      },
      onError,
    });
  if (isLoading) {
    return <Progress />;
  }
  if (data === null || data === undefined) {
    return null;
  }
  return (
    <Card className="relative m-0 bg-base-100 p-0">
      {onOwnProfile ? (
        <Button
          aria-label="Remove current flight"
          className="absolute right-0 top-0 z-20 opacity-25 hover:opacity-75"
          color="ghost"
          shape="circle"
          size="sm"
          onClick={() => {
            setIsDeleteFlightModalOpen(true);
          }}
        >
          ✕
        </Button>
      ) : null}
      <Card
        className={classNames(
          'border-2 shadow-sm',
          theme === AppTheme.LOFI
            ? CARD_COLORS_LOFI[data.delayStatus]
            : CARD_COLORS[data.delayStatus],
          theme === AppTheme.LOFI
            ? CARD_BORDER_COLORS_LOFI[data.delayStatus]
            : CARD_BORDER_COLORS[data.delayStatus],
        )}
        bordered
      >
        <CardBody className="gap-0 px-[0.75rem] py-[0.5rem] sm:px-[1.25rem] sm:pt-[0.75rem]">
          <div className="flex w-full items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex flex-1 flex-col">
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
              <div className="flex flex-wrap items-center gap-x-2 whitespace-nowrap">
                <img
                  alt={`${data.airline?.name} Logo`}
                  className="max-h-[25px] max-w-[100px]"
                  src={data.airline?.logo ?? ''}
                />
                <div className="flex flex-col">
                  <Link
                    className="pt-1 font-mono"
                    hover
                    href={`https://www.flightaware.com/live/flight/${data.airline?.icao}${data.flightNumber}`}
                    target="_blank"
                  >
                    {data.flightNumberString}
                  </Link>
                  {data.airframe?.operator !== null &&
                  data.airframe?.operator !== undefined ? (
                    <div className="hidden text-xs opacity-75 sm:block">
                      Operated by {data.airframe.operator.name}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="font-semibold">{data.flightStatus}</div>
            <div className="flex flex-1 flex-col items-end">
              <div className="opacity-75">{data.aircraftType?.name}</div>
              {data.tailNumber !== null && data.tailNumber.length > 0 ? (
                <Link
                  className="ml-3 pt-[1px] font-mono font-semibold"
                  hover
                  href={
                    data.airframe !== null
                      ? `https://www.planespotters.net/hex/${data.airframe.icao24.toUpperCase()}`
                      : `https://www.flightaware.com/resources/registration/${data.tailNumber}`
                  }
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
          <div className="flex w-full justify-between gap-2">
            <div className="flex flex-1 flex-col overflow-hidden whitespace-nowrap">
              <div className="truncate text-xs sm:text-sm">
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
                        ? 'mr-2 text-xs line-through opacity-75'
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
              {data.progress > 0 && data.progress < 1 ? (
                <div className="flex items-center justify-start gap-1 text-xs italic opacity-75">
                  <span className="mb-[-1px] font-mono">
                    {data.durationToDepartureAbbrString}
                  </span>
                  ago
                </div>
              ) : null}
              <div
                className={classNames(
                  'flex flex-1 flex-wrap items-center gap-x-2',
                  TEXT_COLORS[data.departureDelayStatus],
                )}
              >
                {data.departureGate !== null ? (
                  <div className="text-sm font-semibold sm:text-base">
                    Gate {data.departureGate}
                  </div>
                ) : null}
                {data.departureTerminal !== null ? (
                  <div className="flex items-center text-xs sm:gap-1 sm:text-sm">
                    Terminal {data.departureTerminal}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-xs italic opacity-75 sm:text-sm">
                {data.progress === 0 && data.flightProgress === 0
                  ? `Departs in ${data.durationToDepartureString}`
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
                {data.progress === 1 && data.flightProgress === 1
                  ? `Arrived ${data.durationToArrivalString} ago`
                  : null}
              </div>
              {data.arrivalBaggage !== null ? (
                <div
                  className={classNames(
                    'text-sm font-semibold sm:text-base',
                    TEXT_COLORS[data.arrivalDelayStatus],
                  )}
                >
                  Baggage Claim {data.arrivalBaggage}
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden whitespace-nowrap">
              <div className="truncate text-right text-xs sm:text-sm">
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
                        ? 'text-xs line-through opacity-75'
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
              {data.progress > 0 && data.progress < 1 ? (
                <div className="flex items-center justify-end gap-1 text-xs italic opacity-75">
                  in
                  <span className="mb-[-1px] font-mono">
                    {data.durationToArrivalAbbrString}
                  </span>
                </div>
              ) : null}
              <div
                className={classNames(
                  'flex flex-1 flex-wrap items-center justify-end gap-x-2',
                  TEXT_COLORS[data.arrivalDelayStatus],
                )}
              >
                {data.arrivalGate !== null ? (
                  <div className="text-sm font-semibold sm:text-base">
                    Gate {data.arrivalGate}
                  </div>
                ) : null}
                {data.arrivalTerminal !== null ? (
                  <div className="flex items-center text-xs sm:gap-1 sm:text-sm">
                    Terminal {data.arrivalTerminal}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Modal
        actionButtons={[
          {
            children: 'Cancel',
            color: 'secondary',
            outline: true,
            onClick: () => {
              setIsDeleteFlightModalOpen(false);
            },
          },
          {
            children: !isDeleteFlightLoading ? 'Delete Flight' : null,
            className: 'w-[125px]',
            loading: isDeleteFlightLoading,
            color: 'primary',
            onClick: () => {
              mutate({ id: data.id });
            },
          },
        ]}
        open={isDeleteFlightModalOpen}
        onClose={() => {
          setIsDeleteFlightModalOpen(false);
        }}
        title="Delete Flight"
      >
        <div className="pt-4">
          Are you sure you want to delete your{' '}
          <strong>
            {data?.departureAirport.iata ?? ''} -{' '}
            {data?.arrivalAirport.iata ?? ''}
          </strong>{' '}
          flight?
        </div>
      </Modal>
    </Card>
  );
};
