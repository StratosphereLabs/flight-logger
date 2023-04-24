import {
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useParams } from 'react-router-dom';
import { LoadingCard } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../common/hooks';
import { darkModeStyle } from '../common/mapStyle';
import { AppTheme, useThemeStore } from '../stores';
import { trpc } from '../utils/trpc';

export const MapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
  });
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserMapData.useQuery({
    username,
  });
  useTRPCErrorHandler(error);
  const { theme } = useThemeStore();
  return (
    <LoadingCard
      isLoading={!isLoaded || isFetching}
      className="min-h-[450px] min-w-[350px] flex-1 bg-base-100 shadow-lg"
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
        {data?.routes?.map(({ departureAirport, arrivalAirport }) => (
          <PolylineF
            key={`${departureAirport.id}_${arrivalAirport.id}`}
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
