import { useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { isAfter, isBefore, sub } from 'date-fns';
import { useState } from 'react';
import { Badge, Button, Loading } from 'stratosphere-ui';

import { CollapseIcon, ExpandIcon, TrackAircraftIcon } from '..';
import { type FlightsRouterOutput } from '../../../../app/routes/flights';
import { type AircraftPageNavigationState } from '../../../pages';
import {
  sortByArrivalTimeDesc,
  sortByDepartureTimeAsc,
} from '../../../pages/Home/utils';
import { trpc } from '../../../utils/trpc';
import {
  useAircraftPhotoQuery,
  useCardClassNames,
  useLoggedInUserQuery,
} from '../../hooks';
import { AircraftFlightHistoryRow } from './AircraftFlightHistoryRow';

export interface FlightAircraftDetailsProps {
  data?: FlightsRouterOutput['getFlight'];
  showTrackMyAircraftButton?: boolean;
  showFlightActivity?: boolean;
}

export const FlightAircraftDetails = ({
  data,
  showTrackMyAircraftButton,
  showFlightActivity,
}: FlightAircraftDetailsProps): JSX.Element | null => {
  const cardClassNames = useCardClassNames();
  const navigate = useNavigate();
  const [isAircraftImageExpanded, setIsAircraftImageExpanded] = useState(false);
  const { icao24 } = useParams({ from: '/aircraft/$icao24' });
  const { data: userData } = useLoggedInUserQuery();
  const { data: photoData, isFetching } = useAircraftPhotoQuery(
    data?.airframeId ?? null,
  );
  const { data: flightActivityData, isLoading: isFlightActivityLoading } =
    trpc.flights.getAircraftOtherFlights.useQuery(
      {
        icao24: icao24 ?? '',
      },
      {
        enabled: showFlightActivity === true && icao24 !== undefined,
      },
    );
  if (data === undefined) {
    return null;
  }
  const onOwnProfile = userData !== undefined && userData.id === data.userId;
  const tailNumber = data.airframe?.registration ?? data.tailNumber ?? null;
  const previousPageName = `${data.tailNumber}${data.aircraftType !== null ? ` (${data.aircraftType.icao})` : ''}`;
  return (
    <div
      className={classNames(
        'flex w-full flex-col justify-between gap-2',
        cardClassNames,
      )}
    >
      <div className="truncate font-semibold">{data.aircraftType?.name}</div>
      <div
        className={classNames(
          isAircraftImageExpanded
            ? 'flex flex-col-reverse gap-4'
            : 'flex gap-4',
        )}
      >
        <div className="flex w-full flex-1 flex-col justify-between gap-1 py-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm opacity-75">ICAO Code</span>
            <Badge color="info" size="md" className="font-mono">
              {data.aircraftType?.icao}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm opacity-75">Tail Number</span>
            {tailNumber !== null ? (
              <span className="font-mono text-base opacity-90">
                {tailNumber}
              </span>
            ) : (
              <span className="text-sm opacity-90">N/A</span>
            )}
          </div>
          <div className="flex h-6 items-center justify-between gap-2">
            <span className="text-sm opacity-75">Hex Code</span>
            {data.airframe !== null ? (
              <span className="font-mono text-sm opacity-90">
                {data.airframe.icao24}
              </span>
            ) : (
              <span className="text-sm opacity-90">N/A</span>
            )}
          </div>
        </div>
        <div
          className={classNames(
            'relative flex flex-col justify-center overflow-hidden',
            isAircraftImageExpanded ? 'w-full' : 'w-41',
          )}
        >
          {photoData?.photos[0] !== undefined ? (
            <>
              {isAircraftImageExpanded ? (
                <div className="absolute top-[2px] right-[2px] rounded-full bg-radial from-black/20 to-transparent">
                  <Button
                    color="ghost"
                    onClick={() => {
                      setIsAircraftImageExpanded(false);
                    }}
                    shape="circle"
                    size="sm"
                  >
                    <CollapseIcon className="h-6 w-6" />
                    <span className="sr-only">Collapse Image</span>
                  </Button>
                </div>
              ) : (
                <Button
                  color="ghost"
                  onClick={() => {
                    setIsAircraftImageExpanded(true);
                  }}
                  className="absolute top-0 left-0 flex h-24 w-full items-center justify-center bg-radial from-black/50 to-transparent opacity-0 transition-opacity focus-within:opacity-100 hover:border-transparent hover:bg-transparent hover:opacity-100 hover:shadow-none hover:outline-transparent focus:border-transparent focus:bg-transparent focus:shadow-none focus:outline-transparent"
                >
                  <ExpandIcon className="h-6 w-6" />
                  <span className="sr-only">Expand Image</span>
                </Button>
              )}
              <img
                src={
                  isAircraftImageExpanded
                    ? photoData.photos[0].thumbnail_large.src
                    : photoData.photos[0].thumbnail.src
                }
                alt="Photo unavailable"
                className={classNames(
                  isAircraftImageExpanded
                    ? 'rounded-box w-full object-cover shadow-sm'
                    : 'rounded-box h-23 w-41 object-cover shadow-sm',
                )}
              />
              <p className="bg-base-100/60 text-base-content/80 absolute bottom-0 w-full truncate px-1 text-center text-xs">
                © {photoData.photos[0].photographer}
              </p>
            </>
          ) : null}
          {photoData?.photos[0] === undefined ? (
            <div className="rounded-box bg-base-100 flex h-23 w-41 items-center justify-center">
              {isFetching ? <Loading /> : 'Photo unavailable'}
            </div>
          ) : null}
        </div>
      </div>
      {data?.airframeId !== null &&
      data.airframeId !== undefined &&
      data.user !== null &&
      isAfter(new Date(), sub(data.outTime, { days: 2 })) &&
      isBefore(new Date(), data.outTime) &&
      showTrackMyAircraftButton === true ? (
        <Button
          className="mt-1"
          color="neutral"
          onClick={() => {
            navigate(`/aircraft/${data.airframeId}`, {
              state: {
                previousPageName,
              } as const as AircraftPageNavigationState,
            });
          }}
        >
          <TrackAircraftIcon className="h-6 w-6" />
          Track{' '}
          {onOwnProfile
            ? 'my'
            : `${data.user.firstName ?? data.user.username}'s`}{' '}
          Aircraft
        </Button>
      ) : null}
      {showFlightActivity === true ? (
        <>
          <div className="divider my-0" />
          {isFlightActivityLoading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : null}
          {flightActivityData !== undefined &&
          flightActivityData.count === 0 &&
          !isFlightActivityLoading ? (
            <div className="my-4 text-center">No Flights Found</div>
          ) : null}
          {flightActivityData !== undefined &&
          flightActivityData.count > 0 &&
          !isFlightActivityLoading ? (
            <div className="mx-[-4px] mt-1 mb-[-4px] flex flex-1 flex-col gap-2">
              {data.flightState !== 'COMPLETED' ? (
                <AircraftFlightHistoryRow
                  flight={data}
                  previousPageName={previousPageName}
                />
              ) : null}
              {flightActivityData?.groupedFlights.UPCOMING?.sort(
                sortByDepartureTimeAsc,
              ).map(flight => (
                <AircraftFlightHistoryRow
                  key={flight.id}
                  flight={flight}
                  previousPageName={previousPageName}
                />
              ))}
              {data.flightState === 'COMPLETED' ? (
                <AircraftFlightHistoryRow
                  flight={data}
                  previousPageName={previousPageName}
                />
              ) : null}
              {flightActivityData?.groupedFlights.COMPLETED?.sort(
                sortByArrivalTimeDesc,
              ).map(flight => (
                <AircraftFlightHistoryRow
                  key={flight.id}
                  flight={flight}
                  previousPageName={previousPageName}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
