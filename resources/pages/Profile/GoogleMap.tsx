import {
  GoogleMap as GoogleMapComponent,
  HeatmapLayerF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { darkModeStyle } from '../../common/mapStyle';
import { AppTheme, useThemeStore } from '../../stores';
import { type MapCardFormData } from './MapCard';
import { type FilteredMapData, type MapCoords } from './utils';

export interface GoogleMapProps {
  center: MapCoords;
  data: FilteredMapData;
  hoverAirportId: string | null;
  methods: UseFormReturn<MapCardFormData>;
  selectedAirportId: string | null;
  setHoverAirportId: Dispatch<SetStateAction<string | null>>;
  setSelectedAirportId: Dispatch<SetStateAction<string | null>>;
}

export const GoogleMap = ({
  center,
  data,
  hoverAirportId,
  methods,
  selectedAirportId,
  setSelectedAirportId,
  setHoverAirportId,
}: GoogleMapProps): JSX.Element | null => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [showCompleted, showUpcoming, mapMode] = useWatch<
    MapCardFormData,
    ['showCompleted', 'showUpcoming', 'mapMode']
  >({
    control: methods.control,
    name: ['showCompleted', 'showUpcoming', 'mapMode'],
  });
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const heatmapData = useMemo(
    () =>
      mapMode === 'heatmap'
        ? data.heatmap.map(
            ({ lat, lng }) => new google.maps.LatLng(lat, lng),
          ) ?? []
        : [],
    [data.heatmap, mapMode],
  );
  useEffect(() => {
    setTimeout(() => heatmap?.setData(heatmapData));
  }, [heatmap, heatmapData]);
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
  return isLoaded ? (
    <GoogleMapComponent
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
      {data.airports?.map(({ id, lat, lon, hasSelectedRoute }) => {
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
                hasSelectedRoute || selectedAirportId === null ? 10 : undefined,
            }}
          />
        );
      })}
      {data.routes?.map(
        ({ airports, isCompleted, inFuture, isHover, isSelected }, index) => {
          const isActive = isSelected || isHover;
          return (
            <PolylineF
              visible={mapMode === 'routes'}
              key={index}
              options={{
                strokeOpacity:
                  selectedAirportId === null || isSelected ? 0.5 : 0.1,
                strokeColor: isActive
                  ? 'blue'
                  : isCompleted && (!showUpcoming || showCompleted)
                    ? 'red'
                    : 'white',
                strokeWeight: isActive ? 4 : 2,
                zIndex: isActive ? 10 : inFuture ? 5 : undefined,
                geodesic: true,
              }}
              path={[
                { lat: airports[0].lat, lng: airports[0].lon },
                { lat: airports[1].lat, lng: airports[1].lon },
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
    </GoogleMapComponent>
  ) : null;
};
