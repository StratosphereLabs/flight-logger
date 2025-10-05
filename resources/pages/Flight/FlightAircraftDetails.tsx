import classNames from 'classnames';
import { Badge, Loading } from 'stratosphere-ui';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { useAircraftPhotoQuery, useCardClassNames } from '../../common/hooks';

export interface FlightAircraftDetailsProps {
  data: FlightsRouterOutput['getFlight'];
}

export const FlightAircraftDetails = ({
  data,
}: FlightAircraftDetailsProps): JSX.Element => {
  const cardClassNames = useCardClassNames();
  const { data: photoData, isFetching } = useAircraftPhotoQuery(
    data?.airframeId ?? null,
  );
  const tailNumber = data.airframe?.registration ?? data.tailNumber ?? null;
  return (
    <div
      className={classNames(
        'flex w-full justify-between gap-4',
        cardClassNames,
      )}
    >
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div className="truncate font-semibold">{data.aircraftType?.name}</div>
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
  );
};
