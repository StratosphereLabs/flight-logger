import classNames from 'classnames';
import { isAfter, isBefore, sub } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Loading } from 'stratosphere-ui';

import { TrackAircraftIcon } from '..';
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
  const { icao24 } = useParams();
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
  return (
    <div
      className={classNames(
        'flex w-full flex-col justify-between gap-2',
        cardClassNames,
      )}
    >
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          <div className="truncate font-semibold">
            {data.aircraftType?.name}
          </div>
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm opacity-80">ICAO Code</span>
              <Badge color="info" size="md" className="font-mono">
                {data.aircraftType?.icao}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm opacity-80">Tail Number</span>
              {tailNumber !== null ? (
                <span className="font-mono text-base opacity-90">
                  {tailNumber}
                </span>
              ) : (
                <span className="text-sm opacity-90">N/A</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm opacity-80">Hex Code</span>
              {data.airframe !== null ? (
                <span className="font-mono text-sm opacity-90">
                  {data.airframe.icao24}
                </span>
              ) : (
                <span className="text-sm opacity-90">N/A</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-42 flex-col justify-center overflow-hidden">
          {photoData?.photos[0] !== undefined ? (
            <img
              src={photoData.photos[0].thumbnail.src}
              alt="Photo unavailable"
              className="rounded-box h-24 w-42 object-cover shadow-sm"
            />
          ) : null}
          {photoData?.photos[0] === undefined ? (
            <div className="rounded-box bg-base-100 flex h-24 w-42 items-center justify-center">
              {isFetching ? <Loading /> : 'Photo unavailable'}
            </div>
          ) : null}
          <p className="truncate text-center text-xs opacity-75">
            {photoData?.photos[0]?.photographer ?? ''}
          </p>
        </div>
      </div>
      {data?.airframeId !== null &&
      data.airframeId !== undefined &&
      data.user !== null &&
      isAfter(new Date(), sub(data.outTime, { days: 2 })) &&
      isBefore(new Date(), data.outTime) &&
      showTrackMyAircraftButton === true ? (
        <Button
          color="neutral"
          onClick={() => {
            navigate(`/aircraft/${data.airframeId}`, {
              state: {
                previousPageName: `${data.flightNumberString} (${data.departureAirport.iata}-${data.arrivalAirport.iata})`,
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
              <AircraftFlightHistoryRow
                flight={data}
                previousPageName={`${data.tailNumber}${data.aircraftType !== null ? ` (${data.aircraftType.icao})` : ''}`}
              />
              {flightActivityData?.groupedFlights.UPCOMING?.sort(
                sortByDepartureTimeAsc,
              ).map(flight => (
                <AircraftFlightHistoryRow
                  key={flight.id}
                  flight={flight}
                  previousPageName={`${data.tailNumber}${data.aircraftType !== null ? ` (${data.aircraftType.icao})` : ''}`}
                />
              ))}
              {flightActivityData?.groupedFlights.COMPLETED?.sort(
                sortByArrivalTimeDesc,
              ).map(flight => (
                <AircraftFlightHistoryRow
                  key={flight.id}
                  flight={flight}
                  previousPageName={`${data.tailNumber}${data.aircraftType !== null ? ` (${data.aircraftType.icao})` : ''}`}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
