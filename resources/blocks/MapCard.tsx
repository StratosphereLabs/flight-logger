import {
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { LoadingCard } from '../common/components';
import { useFlightMapQuery } from '../common/hooks';
import { darkModeStyle } from '../common/mapStyle';
import { AppTheme, useAppContext } from '../context';

export const MapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
  });
  const { data, isLoading } = useFlightMapQuery();
  const { theme } = useAppContext();
  return (
    <LoadingCard
      isLoading={!isLoaded || isLoading}
      className="shadow-xl flex-1 bg-base-200 min-h-[400px] min-w-[500px]"
    >
      <GoogleMap
        mapContainerStyle={{
          height: '100%',
          width: '100%',
        }}
        center={{ lat: 37, lng: -122 }}
        zoom={3}
        options={{
          streetViewControl: false,
          gestureHandling: 'greedy',
          styles: theme === AppTheme.DARK ? darkModeStyle : undefined,
        }}
      >
        {data?.airports?.map(({ id, lat, lon }) => (
          <MarkerF key={id} position={{ lat, lng: lon }} />
        ))}
        {data?.routes?.map(({ departureAirport, arrivalAirport }, index) => (
          <PolylineF
            key={index}
            options={{
              strokeOpacity: 0.5,
              strokeColor: 'red',
              geodesic: true,
            }}
            path={[
              { lat: departureAirport.lat, lng: departureAirport.lon },
              { lat: arrivalAirport.lat, lng: arrivalAirport.lon },
            ]}
          />
        ))}
      </GoogleMap>
    </LoadingCard>
  );
};
