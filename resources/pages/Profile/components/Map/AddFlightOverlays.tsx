import { MarkerF, PolylineF } from '@react-google-maps/api';
import { useEffect } from 'react';

import { AirportLabelOverlay } from '../../../../common/components';
import { useTRPCErrorHandler } from '../../../../common/hooks';
import { useIsDarkMode } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';
import { useAddFlightStore } from '../Flights/addFlightStore';
import { addFlightFormDefaultValues } from '../Flights/constants';

export interface AddFlightOverlaysProps {
  map: google.maps.Map | null;
}

export const AddFlightOverlays = ({
  map,
}: AddFlightOverlaysProps): JSX.Element => {
  const { flightSearchFormData, isAddingFlight } = useAddFlightStore();
  const onError = useTRPCErrorHandler();
  const isDarkMode = useIsDarkMode();
  const { data: flightSearchData } =
    trpc.flightData.fetchFlightsByFlightNumber.useQuery(
      flightSearchFormData ?? addFlightFormDefaultValues,
      {
        enabled: flightSearchFormData !== null,
        keepPreviousData: true,
        onError,
      },
    );
  useEffect(() => {
    if (map !== null && flightSearchData !== undefined) {
      const bounds = new window.google.maps.LatLngBounds();
      for (const { lat, lon } of flightSearchData.airports) {
        bounds.extend(new window.google.maps.LatLng(lat, lon));
      }
      for (const { midpoint } of flightSearchData.routes) {
        bounds.extend(
          new window.google.maps.LatLng(midpoint.lat, midpoint.lng),
        );
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 150,
          left: 50,
          right: 50,
          bottom: 50,
        });
      }
    }
  }, [flightSearchData, isAddingFlight, map]);
  return (
    <>
      {isAddingFlight &&
        flightSearchData?.routes?.map(({ airports, isCompleted }, index) => (
          <PolylineF
            key={index}
            options={{
              strokeOpacity: isDarkMode ? 0.5 : 1,
              strokeColor: 'red',
              strokeWeight: 2,
              zIndex: isCompleted ? 10 : 5,
              geodesic: true,
            }}
            path={[
              { lat: airports[0].lat, lng: airports[0].lon },
              { lat: airports[1].lat, lng: airports[1].lon },
            ]}
          />
        ))}
      {isAddingFlight &&
        flightSearchData?.airports?.map(({ id, lat, lon, iata }) => (
          <>
            <AirportLabelOverlay
              iata={iata}
              isFocused
              position={{ lat, lng: lon }}
              show
            />
            <MarkerF
              key={id}
              position={{ lat, lng: lon }}
              title={id}
              options={{
                icon:
                  window.google !== undefined
                    ? {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: 'white',
                        fillOpacity: 1,
                        scale: 4,
                        strokeColor: 'black',
                        strokeWeight: 1.5,
                        strokeOpacity: 1,
                      }
                    : null,
                zIndex: 30,
              }}
            />
          </>
        ))}
    </>
  );
};
