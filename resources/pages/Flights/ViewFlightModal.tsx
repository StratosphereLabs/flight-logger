import classNames from 'classnames';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';

import {
  FlightChangelogTable,
  FlightTimesDisplay,
  OnTimePerformanceChart,
  RightArrowIcon,
  WeatherInfo,
} from '../../common/components';
import { TEXT_COLORS } from '../../common/constants';
import { AppTheme, useThemeStore } from '../../stores';
import { useFlightsPageStore } from './flightsPageStore';

export const ViewFlightModal = (): JSX.Element | null => {
  const { activeFlight, isViewDialogOpen, setIsViewDialogOpen } =
    useFlightsPageStore();
  const navigate = useNavigate();
  const { flightId, username } = useParams();
  const { theme } = useThemeStore();
  const onClose = useCallback(() => {
    setIsViewDialogOpen(false);
    if (flightId !== undefined) {
      navigate(
        username !== undefined ? `/user/${username}/flights` : '/flights',
      );
    }
  }, [flightId, navigate, setIsViewDialogOpen, username]);
  if (activeFlight === null) return null;
  const tailNumber =
    activeFlight.airframe?.registration ?? activeFlight.tailNumber ?? null;
  return (
    <Modal
      actionButtons={[
        {
          children: 'Done',
          onClick: onClose,
          soft: true,
        },
      ]}
      className="h-[95vh] w-[95vw] max-w-[700px] px-2 sm:px-6"
      onClose={onClose}
      open={isViewDialogOpen}
      title=""
    >
      <div className="flex flex-1 flex-col items-center gap-4">
        {typeof activeFlight.airline?.logo === 'string' ? (
          <div className="flex w-[200px] justify-center">
            <img
              alt={`${activeFlight.airline.name} Logo`}
              className="max-h-[80px] max-w-[200px]"
              src={activeFlight.airline.logo}
            />
          </div>
        ) : null}
        <div className="flex w-full flex-col gap-1">
          <div className="text-center text-lg font-bold opacity-90">
            {activeFlight.airline?.name} {activeFlight.flightNumber}
          </div>
          <div className="text-center text-sm font-semibold opacity-80">
            {activeFlight.outDateLocal}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-stretch gap-4">
            <div className="flex flex-1 justify-center">
              <div className="max-w-[125px] sm:max-w-[250px]">
                <div className="font-mono text-4xl font-bold">
                  {activeFlight.departureAirport.iata}
                </div>
                <div className="truncate text-sm sm:text-base">
                  {activeFlight.departureMunicipalityText}
                </div>
                <FlightTimesDisplay
                  className="font-mono"
                  data={{
                    delayStatus: activeFlight.departureDelayStatus,
                    actualValue: activeFlight.outTimeActualValue,
                    value: activeFlight.outTimeValue,
                    actualLocal: activeFlight.outTimeActualLocal,
                    local: activeFlight.outTimeLocal,
                    actualDaysAdded: activeFlight.outTimeActualDaysAdded,
                    daysAdded: 0,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center">
              <RightArrowIcon className="h-8 w-8 opacity-80" />
            </div>
            <div className="flex flex-1 justify-center">
              <div className="max-w-[125px] sm:max-w-[250px]">
                <div className="font-mono text-4xl font-bold">
                  {activeFlight.arrivalAirport.iata}
                </div>
                <div className="truncate text-sm sm:text-base">
                  {activeFlight.arrivalMunicipalityText}
                </div>
                <FlightTimesDisplay
                  className="font-mono"
                  data={{
                    delayStatus: activeFlight.arrivalDelayStatus,
                    actualValue: activeFlight.inTimeActualValue,
                    value: activeFlight.inTimeValue,
                    actualLocal: activeFlight.inTimeActualLocal,
                    local: activeFlight.inTimeLocal,
                    actualDaysAdded: activeFlight.inTimeActualDaysAdded,
                    daysAdded: activeFlight.inTimeDaysAdded,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center text-sm italic opacity-80 sm:text-base">
            {activeFlight.durationString} (
            {activeFlight.distance.toLocaleString()} miles)
          </div>
          <div
            className={classNames(
              'flex justify-center gap-3',
              activeFlight.delayStatus !== 'none' && 'font-semibold',
              TEXT_COLORS[activeFlight.delayStatus],
              [AppTheme.LOFI, AppTheme.CYBERPUNK].includes(theme) &&
                'brightness-90',
            )}
          >
            <span>{activeFlight.flightStatusText}</span>
            <span>
              {activeFlight.delayStatus === 'canceled'
                ? 'Canceled'
                : activeFlight.delayStatus !== 'none'
                  ? `Delayed ${activeFlight.delay}`
                  : 'On Time'}
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-8">
          <div className="max-w-[200px] text-sm sm:text-base">
            {activeFlight.aircraftType?.name}
          </div>
          {tailNumber !== null ? (
            <div className="flex items-center gap-2 font-mono text-lg">
              {tailNumber}
              <div className="text-xs opacity-80">
                {activeFlight.airframe?.icao24}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="divider" />
      <OnTimePerformanceChart flightId={activeFlight.id} />
      <WeatherInfo flightId={activeFlight.id} />
      <FlightChangelogTable className="mt-4" flightId={activeFlight.id} />
    </Modal>
  );
};
