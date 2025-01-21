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

import {
  AirportLabelOverlay,
  PlaneSolidIcon,
} from '../../../../common/components';
import { TOOLTIP_COLORS } from '../../../../common/constants';
import { darkModeStyle, lightModeStyle } from '../../../../common/mapStyle';
import { useIsDarkMode } from '../../../../stores';
import { getAltitudeColor } from '../../../../utils/colors';
import { type MapCardFormData } from '../../Profile';
import { useAddFlightStore } from '../Flights/addFlightStore';
import { AddFlightOverlays } from './AddFlightOverlays';
import type { FilteredMapData, MapFlight } from './types';

export interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  currentFlight?: MapFlight;
  data: FilteredMapData;
  hoverAirportId: string | null;
  methods: UseFormReturn<MapCardFormData>;
  selectedAirportId: string | null;
  setHoverAirportId: Dispatch<SetStateAction<string | null>>;
  setSelectedAirportId: (newId: string | null) => void;
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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMode] = useWatch<MapCardFormData, ['mapMode']>({
    control: methods.control,
    name: ['mapMode'],
  });
  const [showAirportLabels, setShowAirportLabels] = useState(false);
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const heatmapData = useMemo(
    () =>
      window.google !== undefined && mapMode === 'heatmap'
        ? (data.heatmap.map(
            ({ lat, lng }) => new window.google.maps.LatLng(lat, lng),
          ) ?? [])
        : [],
    [data.heatmap, mapMode],
  );
  const { isAddingFlight } = useAddFlightStore();
  useEffect(() => {
    setTimeout(() => heatmap?.setData(heatmapData));
  }, [heatmap, heatmapData]);
  useEffect(() => {
    if (map !== null && !isAddingFlight) {
      const bounds = new window.google.maps.LatLngBounds();
      for (const { lat, lon, hasSelectedRoute } of data.airports) {
        if (selectedAirportId === null || hasSelectedRoute) {
          bounds.extend(new window.google.maps.LatLng(lat, lon));
        }
      }
      for (const { midpoint, isSelected } of data.routes) {
        if (isSelected) {
          bounds.extend(
            new window.google.maps.LatLng(midpoint.lat, midpoint.lng),
          );
        }
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 233,
          left: 25,
          right: 25,
          bottom: 25,
        });
      }
    }
  }, [data.airports, data.routes, isAddingFlight, map, selectedAirportId]);
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
      styles: isDarkMode ? darkModeStyle : lightModeStyle,
      isFractionalZoomEnabled: true,
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
      onLoad={map => {
        setMap(map);
      }}
      onZoomChanged={() => {
        const newZoom = map?.getZoom();
        if (newZoom !== undefined) {
          setShowAirportLabels(newZoom > 3);
        }
      }}
    >
      {!isAddingFlight &&
        data.airports?.map(({ id, lat, lon, hasSelectedRoute, iata }) => {
          const isActive = selectedAirportId === id || hoverAirportId === id;
          const isFocused =
            isActive || hasSelectedRoute || selectedAirportId === null;
          return (
            <>
              {mapMode === 'routes' ? (
                <AirportLabelOverlay
                  iata={iata}
                  isFocused={isFocused}
                  position={{ lat, lng: lon }}
                  show={isActive || hasSelectedRoute || showAirportLabels}
                />
              ) : null}
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
                          fillOpacity: isFocused ? 1 : 0.1,
                          scale: isActive ? 5 : 4,
                          strokeColor: 'black',
                          strokeWeight: isActive ? 2 : 1.5,
                          strokeOpacity: isFocused ? 1 : 0.1,
                        }
                      : null,
                  zIndex: isFocused ? 30 : 25,
                }}
              />
            </>
          );
        })}
      {!isAddingFlight &&
        data.routes?.map(({ airports, isCompleted, isSelected }, index) => {
          const isHover = airports.some(({ id }) => id === hoverAirportId);
          const isActive = isSelected || isHover;
          return (
            <PolylineF
              visible={mapMode === 'routes'}
              key={index}
              options={{
                strokeOpacity: isActive
                  ? 0.75
                  : selectedAirportId === null
                    ? isDarkMode
                      ? 0.5
                      : 1
                    : 0.1,
                strokeColor:
                  isActive || isCompleted
                    ? 'red'
                    : isDarkMode
                      ? 'lightblue'
                      : 'white',
                strokeWeight: isActive ? 3 : 2,
                zIndex: isCompleted ? 10 : 5,
                geodesic: true,
              }}
              path={[
                { lat: airports[0].lat, lng: airports[0].lon },
                { lat: airports[1].lat, lng: airports[1].lon },
              ]}
            />
          );
        })}
      {!isAddingFlight &&
        (currentFlight?.tracklog?.map(({ alt, coord }, index, allItems) => {
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
                strokeOpacity: selectedAirportId === null ? 1 : 0.1,
                strokeColor: getAltitudeColor(
                  lastAltitude !== null ? lastAltitude / 450 : 0,
                ),
                strokeWeight: 3,
                zIndex: 20,
              }}
              path={[
                { lat: prevItem.coord[1], lng: prevItem.coord[0] },
                { lat: coord[1], lng: coord[0] },
              ]}
            />
          );
        }) ??
          null)}
      <AddFlightOverlays map={map} />
      <PolylineF
        visible={mapMode === 'routes'}
        options={{
          strokeOpacity:
            selectedAirportId === null ? (isDarkMode ? 0.5 : 1) : 0.1,
          strokeColor: 'lightblue',
          strokeWeight: 2,
          zIndex: 15,
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
      {mapMode === 'routes' &&
      currentFlight?.flightRadarStatus !== undefined &&
      currentFlight.flightRadarStatus !== null &&
      ['DEPARTED_TAXIING', 'EN_ROUTE', 'ARRIVED_TAXIING'].includes(
        currentFlight.flightRadarStatus,
      ) ? (
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
          zIndex={100}
        >
          <div
            className={classNames(
              'tooltip tooltip-open',
              TOOLTIP_COLORS[currentFlight.delayStatus],
              selectedAirportId === null ? 'opacity-80' : 'opacity-10',
            )}
            data-tip={currentFlight.callsign}
          >
            <PlaneSolidIcon
              className={classNames('h-6 w-6', aircraftColor)}
              style={{
                transform: `rotate(${Math.round(currentFlight.heading - 90)}deg)`,
              }}
            />
          </div>
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
