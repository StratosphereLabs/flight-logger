import {
  GoogleMap,
  HeatmapLayerF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, FormCheckbox, LoadingCard, Select } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const MapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const methods = useForm({
    defaultValues: {
      showUpcoming: false,
      mapMode: 'routes',
    },
  });
  const [showUpcoming, mapMode] = methods.watch(['showUpcoming', 'mapMode']);
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserMapData.useQuery(
    {
      username,
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  );
  const heatmapData = useMemo(
    () =>
      mapMode === 'heatmap'
        ? data?.heatmap.flatMap(({ inFuture, lat, lng }) =>
            showUpcoming || !inFuture ? [new google.maps.LatLng(lat, lng)] : [],
          ) ?? []
        : [],
    [data, mapMode, showUpcoming],
  );
  useEffect(() => {
    setTimeout(() => heatmap?.setData(heatmapData));
  }, [heatmap, heatmapData]);
  useTRPCErrorHandler(error);
  const { theme } = useThemeStore();
  return (
    <LoadingCard
      isLoading={!isLoaded || isFetching}
      className="min-h-[475px] min-w-[350px] flex-1 shadow-md"
    >
      <Form className="flex flex-wrap justify-end gap-4 p-3" methods={methods}>
        <FormCheckbox
          className={classNames(mapMode !== 'heatmap' && 'hidden')}
          labelText="Show upcoming flights"
          name="showUpcoming"
        />
        <Select
          buttonColor="neutral"
          className="w-[150px]"
          formValueMode="id"
          getItemText={({ text }) => text}
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
        {data?.airports?.map(({ id, lat, lon }) => (
          <MarkerF
            visible={mapMode === 'routes'}
            key={id}
            position={{ lat, lng: lon }}
          />
        ))}
        {data?.routes?.map(({ departureAirport, arrivalAirport }) => (
          <PolylineF
            visible={mapMode === 'routes'}
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
        <HeatmapLayerF
          data={heatmapData}
          onLoad={setHeatmap}
          onUnmount={() => {
            setHeatmap(null);
          }}
          options={{
            dissipating: false,
            radius: 2,
            opacity: 0.7,
          }}
        />
      </GoogleMap>
    </LoadingCard>
  );
};
