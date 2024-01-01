import {
  GoogleMap,
  HeatmapLayerF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, FormCheckbox, LoadingCard, Select } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { trpc } from '../../utils/trpc';
import { AirportInfoOverlay } from './AirportInfoOverlay';
import { DEFAULT_COORDINATES } from './constants';
import { getAirports } from './utils';

export interface MapCardFormData {
  showUpcoming: boolean;
  showCompleted: boolean;
  mapMode: 'routes' | 'heatmap';
}

export const MapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [center, setCenter] = useState(DEFAULT_COORDINATES);
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(
    null,
  );
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const methods = useForm<MapCardFormData>({
    defaultValues: {
      showUpcoming: false,
      showCompleted: true,
      mapMode: 'routes',
    },
  });
  const [showUpcoming, showCompleted, mapMode] = useWatch<
    MapCardFormData,
    ['showUpcoming', 'showCompleted', 'mapMode']
  >({
    control: methods.control,
    name: ['showUpcoming', 'showCompleted', 'mapMode'],
  });
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUserMapData.useQuery(
    {
      username,
    },
    {
      select: mapData => {
        const filteredHeatmapData = mapData.heatmap.flatMap(
          ({ inFuture, lat, lng }) =>
            (showUpcoming || !inFuture) && (showCompleted || inFuture)
              ? [new google.maps.LatLng(lat, lng)]
              : [],
        );
        const filteredRoutes = mapData.routes.flatMap(route =>
          (showUpcoming || !route.inFuture) && (showCompleted || route.inFuture)
            ? [
                {
                  ...route,
                  isHover: [
                    route.departureAirport.id,
                    route.arrivalAirport.id,
                  ].includes(hoverAirportId ?? ''),
                  isSelected: [
                    route.departureAirport.id,
                    route.arrivalAirport.id,
                  ].includes(selectedAirportId ?? ''),
                },
              ]
            : [],
        );
        return {
          ...mapData,
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
  useEffect(() => {
    if (data !== undefined) setCenter(data.centerpoint);
  }, [data]);
  useTRPCErrorHandler(error);
  const { theme } = useThemeStore();
  const mapOptions = useMemo(
    () => ({
      center,
      minZoom: 2,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      styles:
        theme === AppTheme.DARK ||
        theme === AppTheme.BUSINESS ||
        theme === AppTheme.SUNSET
          ? darkModeStyle
          : undefined,
    }),
    [center, theme],
  );
  return useMemo(
    () => (
      <LoadingCard
        isLoading={!isLoaded || isFetching}
        className="card-bordered relative min-h-[450px] min-w-[350px] flex-1 shadow-md"
      >
        <GoogleMap
          mapContainerClassName="rounded-2xl"
          mapContainerStyle={{
            height: '100%',
            width: '100%',
          }}
          zoom={3}
          options={mapOptions}
          onClick={() => {
            setSelectedAirportId(null);
          }}
        >
          {data?.airports?.map(({ id, lat, lon, hasSelectedRoute }) => {
            const isActive = selectedAirportId === id || hoverAirportId === id;
            return (
              <MarkerF
                visible={mapMode === 'routes'}
                key={id}
                position={{ lat, lng: lon }}
                title={id}
                onClick={() => {
                  setSelectedAirportId(id);
                }}
                onMouseOver={() => {
                  setHoverAirportId(id);
                }}
                onMouseOut={() => {
                  setHoverAirportId(null);
                }}
                options={{
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: isActive ? 'yellow' : 'white',
                    fillOpacity:
                      hasSelectedRoute || selectedAirportId === null ? 1 : 0.2,
                    scale: isActive ? 8 : 5,
                    strokeColor: 'black',
                    strokeWeight: isActive ? 3 : 2,
                    strokeOpacity:
                      hasSelectedRoute || selectedAirportId === null ? 1 : 0.2,
                  },
                  zIndex:
                    hasSelectedRoute || selectedAirportId === null
                      ? 10
                      : undefined,
                }}
              />
            );
          })}
          {data?.routes?.map(
            (
              {
                departureAirport,
                arrivalAirport,
                inFuture,
                isHover,
                isSelected,
              },
              index,
            ) => {
              const isActive = isSelected || isHover;
              return (
                <PolylineF
                  visible={mapMode === 'routes'}
                  key={index}
                  options={{
                    strokeOpacity:
                      selectedAirportId === null || isSelected ? 0.5 : 0.1,
                    strokeColor: isActive ? 'blue' : inFuture ? 'white' : 'red',
                    strokeWeight: isActive ? 4 : 2,
                    zIndex: isActive ? 10 : inFuture ? 5 : undefined,
                    geodesic: true,
                  }}
                  path={[
                    { lat: departureAirport.lat, lng: departureAirport.lon },
                    { lat: arrivalAirport.lat, lng: arrivalAirport.lon },
                  ]}
                />
              );
            },
          )}
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
        <Form
          className="pointer-events-none absolute flex w-full justify-between gap-2 p-3"
          methods={methods}
        >
          <div className="flex flex-col gap-2">
            <div className="pointer-events-auto flex flex-col rounded-xl bg-base-100/70 px-2">
              <FormCheckbox
                inputClassName="bg-base-200"
                labelText="Show upcoming"
                name="showUpcoming"
              />
              <FormCheckbox
                inputClassName="bg-base-200"
                labelText="Show completed"
                name="showCompleted"
              />
            </div>
            <AirportInfoOverlay airportId={selectedAirportId} />
          </div>
          <Select
            className="pointer-events-auto w-[150px]"
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
            menuClassName="right-0 w-full"
            name="mapMode"
          />
        </Form>
      </LoadingCard>
    ),
    [
      selectedAirportId,
      data,
      heatmapData,
      hoverAirportId,
      isFetching,
      isLoaded,
      mapMode,
      mapOptions,
      methods,
    ],
  );
};
