import {
  GoogleMap as GoogleMapComponent,
  HeatmapLayerF,
  MarkerF,
  OverlayView,
  OverlayViewF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import classNames from 'classnames';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { PlaneSolidIcon } from '../../../../common/components';
import { darkModeStyle } from '../../../../common/mapStyle';
import { useIsDarkMode } from '../../../../stores';
import { getAltitudeColor } from '../../../../utils/colors';
import { type MapCardFormData } from './MapCard';
import type { FilteredMapData, MapCoords, MapFlight } from './types';

export interface GoogleMapProps {
  center: MapCoords;
  currentFlight?: MapFlight;
  data: FilteredMapData;
  hoverAirportId: string | null;
  methods: UseFormReturn<MapCardFormData>;
  selectedAirportId: string | null;
  setHoverAirportId: Dispatch<SetStateAction<string | null>>;
  setSelectedAirportId: Dispatch<SetStateAction<string | null>>;
}

export const GoogleMap = ({
  center,
  currentFlight,
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
  const [mapMode] = useWatch<MapCardFormData, ['mapMode']>({
    control: methods.control,
    name: ['mapMode'],
  });
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const heatmapData = useMemo(
    () =>
      window.google !== undefined && mapMode === 'heatmap'
        ? data.heatmap.map(
            ({ lat, lng }) => new window.google.maps.LatLng(lat, lng),
          ) ?? []
        : [],
    [data.heatmap, mapMode],
  );
  useEffect(() => {
    setTimeout(() => heatmap?.setData(heatmapData));
  }, [heatmap, heatmapData]);
  const isDarkMode = useIsDarkMode();
  const mapOptions = useMemo(
    () => ({
      center,
      minZoom: 2,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      styles: isDarkMode ? darkModeStyle : undefined,
    }),
    [center, isDarkMode],
  );
  const aircraftColor = isDarkMode ? 'text-blue-500' : 'text-[#0000ff]';
  let lastAltitude: number | null = null;
  return isLoaded ? (
    <GoogleMapComponent
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
              icon:
                window.google !== undefined
                  ? {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: isActive ? 'yellow' : 'white',
                      fillOpacity:
                        hasSelectedRoute || selectedAirportId === null
                          ? 1
                          : 0.2,
                      scale: isActive ? 4.5 : 3.5,
                      strokeColor: 'black',
                      strokeWeight: isActive ? 2 : 1.5,
                      strokeOpacity:
                        hasSelectedRoute || selectedAirportId === null
                          ? 1
                          : 0.2,
                    }
                  : null,
              zIndex:
                hasSelectedRoute || selectedAirportId === null ? 10 : undefined,
            }}
          />
        );
      })}
      {data.routes?.map(
        ({ airports, isCompleted, isHover, isSelected }, index) => {
          const isActive = isSelected || isHover;
          return (
            <PolylineF
              visible={mapMode === 'routes'}
              key={index}
              options={{
                strokeOpacity:
                  selectedAirportId === null || isSelected ? 0.75 : 0.1,
                strokeColor: isActive ? 'blue' : isCompleted ? 'red' : 'white',
                strokeWeight: isActive ? 2 : 1.5,
                zIndex: isActive ? 10 : !isCompleted ? 5 : undefined,
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
      {currentFlight?.tracklog?.map(({ alt, coord }, index, allItems) => {
        const prevItem = allItems[index - 1];
        if (prevItem === undefined) return null;
        if (alt !== null) {
          lastAltitude = alt;
        }
        return (
          <PolylineF
            visible={mapMode === 'routes'}
            key={index}
            options={{
              strokeOpacity: selectedAirportId === null ? 0.75 : 0.1,
              strokeColor: getAltitudeColor(
                lastAltitude !== null ? lastAltitude / 450 : 0,
              ),
              strokeWeight: 3,
              zIndex: 10,
              geodesic: true,
            }}
            path={[
              { lat: prevItem.coord[1], lng: prevItem.coord[0] },
              { lat: coord[1], lng: coord[0] },
            ]}
          />
        );
      }) ?? null}
      <PolylineF
        visible={mapMode === 'routes'}
        options={{
          strokeOpacity:
            selectedAirportId === null ? (isDarkMode ? 0.5 : 1) : 0.1,
          strokeColor: 'lightblue',
          strokeWeight: 2,
          zIndex: 5,
          geodesic: true,
        }}
        path={currentFlight?.waypoints?.flatMap(
          ([lng, lat], index, allCoords) => {
            const prevCoord = allCoords[index - 1];
            if (prevCoord === undefined) return [];
            return {
              lat,
              lng,
            };
          },
        )}
      />
      {currentFlight !== undefined ? (
        <OverlayViewF
          position={{
            lat: currentFlight.lat,
            lng: currentFlight.lng,
          }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(width, height) => ({
            x: -(width / 2),
            y: -(height / 2),
          })}
        >
          <PlaneSolidIcon
            className={classNames('h-6 w-6', aircraftColor)}
            style={{
              transform: `rotate(${Math.round(currentFlight.heading - 90)}deg)`,
            }}
          />
        </OverlayViewF>
      ) : null}
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
