import { useNavigate, useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { useState } from 'react';
import { Button, Card, CardBody, Link, Modal } from 'stratosphere-ui';

import {
  FlightTimesDisplay,
  PlaneSolidIcon,
} from '../../../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_COLORS,
  PROGRESS_BAR_COLORS,
  TEXT_COLORS,
} from '../../../../common/constants';
import {
  useLoggedInUserQuery,
  useProfilePage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { AppTheme, useThemeStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';

export const ActiveFlightCard = (): JSX.Element | null => {
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const { data: userData } = useLoggedInUserQuery();
  const enabled = useProfilePage();
  const { username } = useParams({
    from: '/pathlessMainLayout/pathlessProfileLayout/user/$username',
  });
  const { theme } = useThemeStore();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const [isDeleteFlightModalOpen, setIsDeleteFlightModalOpen] = useState(false);
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data } = trpc.flights.getUserActiveFlight.useQuery(
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
      onSuccess: () => {
        handleSuccess('Flight Deleted');
        setIsDeleteFlightModalOpen(false);
        void utils.flights.invalidate();
        void utils.users.invalidate();
        void utils.statistics.invalidate();
      },
      onError,
    });
  if (data === null || data === undefined) {
    return null;
  }
  return (
    <Card className="bg-base-100 relative m-0 p-0">
      <Card
        className={classNames(
          'border-2 shadow-xs',
          CARD_COLORS[data.delayStatus],
          CARD_BORDER_COLORS[data.delayStatus],
        )}
        border
      >
        {onOwnProfile || userData?.id === data.addedByUserId ? (
          <Button
            aria-label="Remove current flight"
            className="absolute top-[-4px] right-[-4px] z-20 opacity-25 hover:opacity-75"
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
        <CardBody className="gap-0 px-[0.5rem] py-[0.5rem] sm:px-[1rem] sm:pt-[0.75rem]">
          <div
            className="flex flex-col gap-1 hover:cursor-pointer"
            onClick={() =>
              navigate({
                to: '/flight/$flightId',
                params: { flightId: data.id },
              })
            }
          >
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex flex-1 flex-col">
                <div
                  className={classNames(
                    'flex text-xs sm:text-sm',
                    data.delayStatus !== 'none' && 'font-semibold',
                    TEXT_COLORS[data.delayStatus],
                    [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                  )}
                >
                  {data.delayStatus === 'canceled'
                    ? 'Canceled'
                    : data.delayStatus !== 'none'
                      ? `Delayed ${data.delay}`
                      : 'On Time'}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-nowrap">
                  <img
                    alt={`${data.airline?.name} Logo`}
                    className="max-h-[25px] max-w-[100px]"
                    src={data.airline?.logo ?? ''}
                  />
                  <div className="flex flex-col text-sm">
                    <Link
                      className="font-mono text-nowrap"
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
                    {data.airframe?.operator !== null &&
                    data.airframe?.operator !== undefined &&
                    data.airframe.operator.id !== data.airline?.id ? (
                      <div className="hidden text-xs opacity-75 sm:block">
                        Operated by {data.airframe.operator.name}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold">
                {data.flightStatusText}
              </div>
              <div className="flex flex-1 flex-col items-end text-xs sm:text-sm">
                <div className="text-right opacity-75">
                  {data.aircraftType?.name}
                </div>
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
                    rel="noreferrer"
                  >
                    {data.tailNumber}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="flex w-full flex-col">
              <div className="flex h-8 w-full items-center justify-between gap-3 font-mono text-3xl font-bold">
                <div>{data.departureAirport.iata}</div>
                <div className="relative h-full flex-1">
                  <div className="absolute top-0 left-0 flex h-full w-full items-center px-2 opacity-50">
                    <progress
                      className={classNames(
                        'progress top-0 left-0 flex-1',
                        PROGRESS_BAR_COLORS[data.delayStatus],
                      )}
                      value={100 * data.progress}
                      max="100"
                    />
                  </div>
                  <div className="absolute top-0 left-0 z-20 h-full w-full px-2">
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
                          [AppTheme.CYBERPUNK].includes(theme) &&
                            'brightness-90',
                        )}
                        style={{
                          transform: 'translate(42%, -6%)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-between">
                    <div className="bg-neutral h-4 w-4 rounded-full" />
                    <div className="bg-neutral h-4 w-4 rounded-full" />
                  </div>
                </div>
                <div>{data.arrivalAirport.iata}</div>
              </div>
              <div className="flex w-full justify-between gap-4">
                <div className="truncate text-sm sm:text-base">
                  {data.departureMunicipalityText}
                </div>
                <div className="truncate text-right text-sm sm:text-base">
                  {data.arrivalMunicipalityText}
                </div>
              </div>
            </div>
            <div className="flex w-full justify-between gap-4">
              <div className="flex flex-1 flex-col gap-1 overflow-hidden whitespace-nowrap">
                <div className="flex flex-wrap gap-x-3">
                  <FlightTimesDisplay
                    className="font-mono"
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
                  {data.progress > 0 && data.progress < 1 ? (
                    <div className="flex items-center justify-start gap-1 text-xs italic opacity-75">
                      <span className="mb-[-1px] font-mono">
                        {data.durationToDepartureAbbrString}
                      </span>
                      ago
                    </div>
                  ) : null}
                </div>
                <div
                  className={classNames(
                    'flex flex-1 flex-wrap items-center gap-x-2',
                    TEXT_COLORS[data.departureDelayStatus],
                    [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
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
                      [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
                    )}
                  >
                    Baggage Claim {data.arrivalBaggage}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1 overflow-hidden whitespace-nowrap">
                <div className="flex flex-wrap-reverse justify-end gap-x-3">
                  {data.progress > 0 && data.progress < 1 ? (
                    <div className="flex items-center justify-end gap-1 text-xs italic opacity-75">
                      in
                      <span className="mb-[-1px] font-mono">
                        {data.durationToArrivalAbbrString}
                      </span>
                    </div>
                  ) : null}
                  <FlightTimesDisplay
                    className="justify-end font-mono"
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
                <div
                  className={classNames(
                    'flex flex-1 flex-wrap items-center justify-end gap-x-2',
                    TEXT_COLORS[data.arrivalDelayStatus],
                    [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
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
          </div>
        </CardBody>
      </Card>
      <Modal
        actionButtons={[
          {
            children: 'Cancel',
            color: 'secondary',
            onClick: () => {
              setIsDeleteFlightModalOpen(false);
            },
            soft: true,
          },
          {
            children: !isDeleteFlightLoading ? 'Delete Flight' : null,
            className: 'w-[150px]',
            disabled: isDeleteFlightLoading,
            loading: isDeleteFlightLoading,
            color: 'primary',
            onClick: () => {
              mutate({ id: data.id });
            },
            soft: true,
          },
        ]}
        open={isDeleteFlightModalOpen}
        onClose={() => {
          setIsDeleteFlightModalOpen(false);
        }}
        title="Delete Flight"
      >
        <div className="pt-4">
          Are you sure you want to delete{' '}
          {data?.user !== null &&
          data?.user !== undefined &&
          data.userId !== userData?.id ? (
            <>
              <strong>{data.user.username}</strong>&apos;s
            </>
          ) : (
            'your'
          )}{' '}
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
