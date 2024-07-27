import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, CardBody, Link, Modal, Progress } from 'stratosphere-ui';
import {
  FlightChangelogTable,
  FlightTimesDisplay,
  PlaneSolidIcon,
} from '../../../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
  PROGRESS_BAR_COLORS,
  TEXT_COLORS,
} from '../../../../common/constants';
import {
  useLoggedInUserQuery,
  useProfilePage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { AppTheme, useIsDarkMode, useThemeStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';

export const ActiveFlightCard = (): JSX.Element | null => {
  const utils = trpc.useUtils();
  const enabled = useProfilePage();
  const { username } = useParams();
  const { theme } = useThemeStore();
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const [isDeleteFlightModalOpen, setIsDeleteFlightModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const isDarkMode = useIsDarkMode();
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data, isLoading } = trpc.flights.getUserActiveFlight.useQuery(
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
        void utils.flights.getUserActiveFlight.invalidate();
        void utils.flights.getFollowingFlights.invalidate();
      },
      onError,
    });
  useEffect(() => {
    const listener: (this: Window, ev: KeyboardEvent) => void = event => {
      if (event.key === 'Escape') {
        setIsActive(false);
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);
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
          'border-2 shadow-sm transition-shadow transition-transform',
          !isActive && 'hover:scale-[1.01]',
          !isActive &&
            (isDarkMode
              ? 'hover:shadow-[0_0px_15px_0_rgba(255,255,255,0.50)]'
              : 'hover:shadow-[0_0px_15px_0_rgba(0,0,0,0.25)]'),
          theme === AppTheme.LOFI
            ? CARD_COLORS_LOFI[data.delayStatus]
            : CARD_COLORS[data.delayStatus],
          theme === AppTheme.LOFI
            ? CARD_BORDER_COLORS_LOFI[data.delayStatus]
            : CARD_BORDER_COLORS[data.delayStatus],
        )}
        bordered
      >
        <CardBody className="gap-0 px-[0.5rem] py-[0.5rem] sm:px-[1rem] sm:pt-[0.75rem]">
          <div
            className="flex flex-col hover:cursor-pointer"
            onClick={() => {
              setIsActive(active => !active);
            }}
          >
            <div className="flex w-full items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-1 flex-col">
                <div
                  className={classNames(
                    'flex',
                    data.delayStatus !== 'none' && 'font-semibold',
                    TEXT_COLORS[data.delayStatus],
                    [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                      'brightness-90',
                  )}
                >
                  {data.delayStatus === 'canceled'
                    ? 'Canceled'
                    : data.delayStatus !== 'none'
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
                      href={
                        data.flightAwareLink !== null
                          ? `https://www.flightaware.com${data.flightAwareLink}`
                          : `https://www.flightaware.com/live/flight/${data.airline?.icao}${data.flightNumber}`
                      }
                      target="_blank"
                    >
                      {data.flightNumberString}
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
                    rel="noreferrer"
                  >
                    {data.tailNumber}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="flex h-8 w-full items-center justify-between gap-3 font-mono text-2xl font-bold sm:text-2xl">
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
                        [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                          'brightness-90',
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
            <div className="flex w-full justify-between gap-3">
              <div className="flex flex-1 flex-col overflow-hidden whitespace-nowrap">
                <div className="truncate text-xs sm:text-sm">
                  {data.departureAirport.municipality},{' '}
                  {data.departureAirport.countryId === 'US'
                    ? data.departureAirport.region.name
                    : data.departureAirport.countryId}
                </div>
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
                    [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                      'brightness-90',
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
                {data.flightRadarStatus !== 'CANCELED' ? (
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
                ) : null}
                {data.arrivalBaggage !== null ? (
                  <div
                    className={classNames(
                      'text-sm font-semibold sm:text-base',
                      TEXT_COLORS[data.arrivalDelayStatus],
                      [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                        'brightness-90',
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
                    [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                      'brightness-90',
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
          {isActive ? <FlightChangelogTable flightId={data.id} /> : null}
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
