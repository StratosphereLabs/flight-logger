import {
  GoogleMap,
  HeatmapLayerF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, FormCheckbox, LoadingCard, Select } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { getAirports } from './utils';

export const MapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [center, setCenter] = useState({ lat: 37, lng: -122 });
  const [activeAirportId, setActiveAirportId] = useState<string | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
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
      select: mapData => {
        const filteredHeatmapData = mapData.heatmap.flatMap(
          ({ inFuture, lat, lng }) =>
            showUpcoming || !inFuture ? [new google.maps.LatLng(lat, lng)] : [],
        );
        const filteredRoutes = mapData.routes.filter(
          ({ inFuture, departureAirport, arrivalAirport }) =>
            (activeAirportId === null ||
              activeAirportId === departureAirport.id ||
              activeAirportId === arrivalAirport.id) &&
            (showUpcoming || !inFuture),
        );
        return {
          heatmap: filteredHeatmapData,
          routes: filteredRoutes,
          airports: getAirports(filteredRoutes),
        };
      },
      staleTime: 5 * 60 * 1000,
    },
  );
  const heatmapData = useMemo(
    () => (mapMode === 'heatmap' ? data?.heatmap ?? [] : []),
    [data?.heatmap, mapMode],
  );
  useEffect(() => {
    setTimeout(() => heatmap?.setData(heatmapData));
  }, [heatmap, heatmapData]);
  useTRPCErrorHandler(error);
  const { theme } = useThemeStore();
  const mapOptions = useMemo(
    () => ({
      center,
      minZoom: 2,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      styles:
        theme === AppTheme.DARK || theme === AppTheme.BUSINESS
          ? darkModeStyle
          : undefined,
    }),
    [center, theme],
  );
  return useMemo(
    () => (
      <LoadingCard
        isLoading={!isLoaded || isFetching}
        className="card-bordered min-h-[450px] min-w-[350px] flex-1 shadow-md relative"
      >
        <GoogleMap
          mapContainerClassName="rounded-2xl"
          mapContainerStyle={{
            height: '100%',
            width: '100%',
          }}
          zoom={3}
          options={mapOptions}
        >
          {data?.airports?.map(({ id, lat, lon, name }) => (
            <MarkerF
              visible={mapMode === 'routes'}
              key={id}
              position={{ lat, lng: lon }}
              title={id}
              onClick={() => {
                if (!isFrozen) {
                  setCenter({ lat, lng: lon });
                }
                setIsFrozen(currentIsFrozen => !currentIsFrozen);
              }}
              onMouseOver={() => {
                if (!isFrozen) {
                  setActiveAirportId(id);
                }
              }}
              onMouseOut={() => {
                if (!isFrozen) {
                  setActiveAirportId(null);
                }
              }}
              options={{
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: activeAirportId === id ? 'yellow' : 'white',
                  fillOpacity: 0.8,
                  scale: activeAirportId === id ? 8 : 5,
                  strokeColor: 'black',
                  strokeWeight: 2,
                  strokeOpacity: 1,
                },
              }}
            />
          ))}
          {data?.routes?.map(({ departureAirport, arrivalAirport }, index) => (
            <PolylineF
              visible={mapMode === 'routes'}
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
        <Form className="flex flex-wrap gap-4 p-3 absolute" methods={methods}>
          <Select
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
          <FormCheckbox
            className="bg-base-100/70 rounded-xl px-2"
            inputClassName="bg-base-200"
            labelText="Show upcoming flights"
            name="showUpcoming"
          />
        </Form>
      </LoadingCard>
    ),
    [
      activeAirportId,
      data,
      heatmapData,
      isFetching,
      isFrozen,
      isLoaded,
      mapMode,
      mapOptions,
      methods,
    ],
  );
};
