import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';

import { FlightChangelogTable, RightArrowIcon } from '../../common/components';
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
      <div className="flex flex-1 flex-col items-center gap-8">
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
          <div className="text-center text-lg font-bold opacity-75">
            Flight #{activeFlight?.flightNumber}
          </div>
          <div className="text-center text-sm opacity-75">
            {activeFlight?.outDateLocal}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-1 justify-center">
              <div className="max-w-[100px] sm:max-w-[200px]">
                <div className="text-xl font-bold">
                  {activeFlight?.departureAirportId}
                </div>
                <div className="truncate text-sm opacity-75">
                  {activeFlight?.departureAirport?.municipality}
                </div>
                <div className="font-mono text-sm font-bold opacity-50">
                  {activeFlight?.outTimeLocal}
                </div>
              </div>
            </div>
            <RightArrowIcon className="h-8 w-8 opacity-75" />
            <div className="flex flex-1 justify-center">
              <div className="max-w-[100px] sm:max-w-[200px]">
                <div className="text-xl font-bold">
                  {activeFlight?.arrivalAirportId}
                </div>
                <div className="truncate text-sm opacity-75">
                  {activeFlight?.arrivalAirport?.municipality}
                </div>
                <div className="font-mono text-sm font-bold opacity-50">
                  {activeFlight?.inTimeLocal}
                  {activeFlight !== null &&
                  activeFlight.inTimeDaysAdded !== 0 ? (
                    <sup>
                      {`${activeFlight.inTimeDaysAdded > 0 ? '+' : ''}${activeFlight.inTimeDaysAdded}`}
                    </sup>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center italic opacity-50">
            {activeFlight?.durationString} ({activeFlight?.distance} mi)
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
      {activeFlight !== null ? (
        <FlightChangelogTable className="mt-10" flightId={activeFlight.id} />
      ) : null}
    </Modal>
  );
};
