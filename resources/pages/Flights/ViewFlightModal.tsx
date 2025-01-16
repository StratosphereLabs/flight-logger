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
import { useFlightsPageStore } from './flightsPageStore';

export const ViewFlightModal = (): JSX.Element => {
  const { activeFlight, isViewDialogOpen, setIsViewDialogOpen } =
    useFlightsPageStore();
  const navigate = useNavigate();
  const { flightId, username } = useParams();
  const onClose = useCallback(() => {
    setIsViewDialogOpen(false);
    if (flightId !== undefined) {
      navigate(
        username !== undefined ? `/user/${username}/flights` : '/flights',
      );
    }
  }, [flightId, navigate, setIsViewDialogOpen, username]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Done',
          color: 'ghost',
          onClick: onClose,
        },
      ]}
      className="w-[95%] max-w-[750px] px-2 sm:px-6"
      onClose={onClose}
      open={isViewDialogOpen}
      title=""
    >
      <div className="flex flex-1 flex-col items-center gap-6">
        {typeof activeFlight?.airline?.logo === 'string' ? (
          <div className="flex w-[200px] justify-center">
            <img
              alt={`${activeFlight.airline.name} Logo`}
              className="max-h-[80px] max-w-[200px]"
              src={activeFlight.airline.logo}
            />
          </div>
        ) : null}
        <div className="flex w-full flex-col gap-2">
          <div className="text-center font-mono text-lg font-bold opacity-75">
            {activeFlight?.airline?.iata} {activeFlight?.flightNumber}
          </div>
          <div className="text-center text-sm opacity-75">
            {activeFlight?.outDateLocal}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-1 justify-center">
              <div className="max-w-[250px]">
                <div className="font-mono text-4xl font-bold">
                  {activeFlight?.departureAirport.iata}
                </div>
                <div className="hidden truncate text-sm opacity-75 sm:block">
                  {activeFlight?.departureAirport.name}
                </div>
                <div className="truncate opacity-75">
                  {activeFlight?.departureAirport.municipality},{' '}
                  {activeFlight?.departureAirport.region.name}
                </div>
                {activeFlight !== null ? (
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
                ) : null}
              </div>
            </div>
            <RightArrowIcon className="h-8 w-8 opacity-75" />
            <div className="flex flex-1 justify-center">
              <div className="max-w-[250px]">
                <div className="font-mono text-4xl font-bold">
                  {activeFlight?.arrivalAirport.iata}
                </div>
                <div className="hidden truncate text-sm opacity-75 sm:block">
                  {activeFlight?.arrivalAirport.name}
                </div>
                <div className="truncate opacity-75">
                  {activeFlight?.arrivalAirport.municipality},{' '}
                  {activeFlight?.arrivalAirport.region.name}
                </div>
                {activeFlight !== null ? (
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
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex justify-center italic opacity-50">
            {activeFlight?.durationString} ({activeFlight?.distance} miles)
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-12">
          <div className="max-w-[150px] sm:max-w-[200px]">
            {activeFlight?.aircraftType?.name}
          </div>
          <div className="flex items-center gap-2 font-mono text-lg">
            {activeFlight?.airframe?.registration ?? activeFlight?.tailNumber}
            <div className="text-xs opacity-75">
              {activeFlight?.airframe?.icao24}
            </div>
          </div>
        </div>
      </div>
      <div className="divider" />
      {activeFlight !== null ? (
        <>
          <OnTimePerformanceChart flightId={activeFlight.id} />
          <WeatherInfo flightId={activeFlight.id} />
          <FlightChangelogTable className="mt-4" flightId={activeFlight.id} />
        </>
      ) : null}
    </Modal>
  );
};
