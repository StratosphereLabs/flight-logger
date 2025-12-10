import { PolylineF } from '@react-google-maps/api';

import { type FlightsRouterOutput } from '../../../../app/routes/flights';
import { useIsDarkMode } from '../../../stores';
import { getAltitudeColor } from '../../../utils/colors';
import { AircraftOverlay } from './AircraftOverlay';

export interface FlightTrackOverlayProps {
  data: Pick<
    FlightsRouterOutput['getFlight'],
    | 'id'
    | 'flightState'
    | 'flightStatus'
    | 'tracklog'
    | 'departureAirport'
    | 'arrivalAirport'
    | 'estimatedLocation'
    | 'waypoints'
    | 'estimatedHeading'
    | 'callsign'
    | 'airline'
    | 'flightNumber'
    | 'estimatedAltitude'
    | 'altChangeString'
    | 'delayStatus'
    | 'user'
  >;
}

export const FlightTrackOverlay = ({
  data,
}: FlightTrackOverlayProps): JSX.Element => {
  const isDarkMode = useIsDarkMode();
  const isCurrentFlight =
    data !== undefined
      ? ['DEPARTED_TAXIING', 'EN_ROUTE', 'LANDED_TAXIING'].includes(
          data.flightStatus,
        )
      : false;
  let lastAltitude: number | null = null;
  return (
    <>
      {data.flightState !== 'UPCOMING' &&
      (data.tracklog === undefined || data.tracklog.length === 0) ? (
        <PolylineF
          options={{
            geodesic: true,
            strokeOpacity: 1,
            strokeColor: getAltitudeColor(0.8),
            strokeWeight: 3,
            zIndex: isCurrentFlight ? 20 : 10,
          }}
          path={[
            {
              lat: data.departureAirport.lat,
              lng: data.departureAirport.lon,
            },
            {
              lat: isCurrentFlight
                ? data.estimatedLocation.lat
                : data.arrivalAirport.lat,
              lng: isCurrentFlight
                ? data.estimatedLocation.lng
                : data.arrivalAirport.lon,
            },
          ]}
        />
      ) : null}
      {data.tracklog?.map(({ alt, coord, ground }, index, allItems) => {
        const prevItem = allItems[index - 1];
        if (prevItem === undefined) return null;
        if (alt !== null) {
          lastAltitude = alt;
        }
        return (
          <PolylineF
            key={index}
            options={{
              strokeOpacity: ground === true ? 0.5 : 1,
              strokeColor:
                ground === true
                  ? isDarkMode
                    ? 'white'
                    : 'darkgray'
                  : getAltitudeColor(
                      lastAltitude !== null ? lastAltitude / 450 : 0,
                    ),
              strokeWeight: 3,
              zIndex: isCurrentFlight ? 20 : 10,
              geodesic: true,
            }}
            path={[
              {
                lat: prevItem.coord[1],
                lng: prevItem.coord[0],
              },
              { lat: coord[1], lng: coord[0] },
            ]}
          />
        );
      }) ?? null}
      {data.flightStatus === 'SCHEDULED' ||
      data.flightStatus === 'DEPARTED_TAXIING' ? (
        <PolylineF
          visible
          options={{
            strokeOpacity: isDarkMode ? 0.5 : 1,
            strokeColor: isDarkMode ? 'white' : 'gray',
            strokeWeight: 2,
            zIndex: isCurrentFlight ? 15 : 5,
            geodesic: true,
          }}
          path={
            data.waypoints?.map(([lng, lat]) => ({
              lat,
              lng,
            })) ?? []
          }
        />
      ) : null}
      {isCurrentFlight ? <AircraftOverlay data={data} /> : null}
    </>
  );
};
