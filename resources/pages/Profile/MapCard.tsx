import {
  GoogleMap,
  HeatmapLayerF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { Card } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, LoadingCard, Select } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const MapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const methods = useForm({
    defaultValues: {
      mapMode: 'routes',
    },
  });
  const mode = methods.watch('mapMode');
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserMapData.useQuery({
    username,
  });
  useTRPCErrorHandler(error);
  const { theme } = useThemeStore();
  return (
    <LoadingCard
      isLoading={!isLoaded || isFetching}
      className="min-h-[500px] min-w-[350px] flex-1 bg-base-100 shadow-lg"
    >
      <Card.Body className="gap-4 pb-0 pl-0 pr-0">
        <Form className="flex justify-end pl-4 pr-4" methods={methods}>
          <Select
            className="w-[120px]"
            getItemText={({ text }) => text}
            getItemValue={({ id }) => id}
            options={[
              {
                id: 'routes',
                text: 'Routes',
              },
              {
                id: 'heatmap',
                text: 'Heatmap',
              },
            ]}
            menuClassName="right-0"
            name="mapMode"
          />
        </Form>
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
            styles:
              theme === AppTheme.DARK || theme === AppTheme.BUSINESS
                ? darkModeStyle
                : undefined,
          }}
        >
          {mode === 'routes'
            ? data?.airports?.map(({ id, lat, lon }) => (
                <MarkerF key={id} position={{ lat, lng: lon }} />
              ))
            : null}
          {mode === 'routes'
            ? data?.routes?.map(({ departureAirport, arrivalAirport }) => (
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
              ))
            : null}
          <HeatmapLayerF
            data={
              data?.heatmap.map(
                ({ lat, lng }) => new google.maps.LatLng(lat, lng),
              ) ?? []
            }
            options={{
              dissipating: false,
              radius: mode === 'heatmap' ? 2 : 0,
              opacity: 0.7,
            }}
          />
        </GoogleMap>
      </Card.Body>
    </LoadingCard>
  );
};
