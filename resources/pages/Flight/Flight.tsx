import {
  GoogleMap,
  MarkerF,
  OverlayView,
  OverlayViewF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button, Tooltip, TooltipContent } from 'stratosphere-ui';

import { AirportLabelOverlay, PlaneSolidIcon } from '../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_BORDER_COLORS_LOFI,
  CARD_COLORS,
  CARD_COLORS_LOFI,
  TOOLTIP_COLORS,
} from '../../common/constants';
import { darkModeStyle, lightModeStyle } from '../../common/mapStyle';
import { getAltChangeString } from '../../common/utils';
import { useMainLayoutStore } from '../../layouts/MainLayout/mainLayoutStore';
import { AppTheme, useIsDarkMode, useThemeStore } from '../../stores';
import { getAltitudeColor } from '../../utils/colors';
import { trpc } from '../../utils/trpc';
import { DEFAULT_COORDINATES } from '../Home/constants';
import { FlightChangelogTable } from './FlightChangelogTable';
import { FlightInfo } from './FlightInfo';
import { OnTimePerformanceChart } from './OnTimePerformanceChart';
import { WeatherInfo } from './WeatherInfo';

export interface FlightPageNavigationState {
  previousPageName: string;
}

export const Flight = (): JSX.Element | null => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const { flightId } = useParams();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const fitBoundsCallCountRef = useRef(0);
  const { data } = trpc.flights.getFlight.useQuery(
    { id: flightId ?? '' },
    { enabled: flightId !== undefined, refetchInterval: 5000 },
  );
  const { setPreviousPageName } = useMainLayoutStore();
  const { theme } = useThemeStore();
  const { state } = useLocation() as {
    state: FlightPageNavigationState | null;
  };
  const [center] = useState(DEFAULT_COORDINATES);
  const isDarkMode = useIsDarkMode();
  const aircraftColor = useMemo(
    () => (isDarkMode ? 'text-blue-500' : 'text-[#0000ff]'),
    [isDarkMode],
  );
  const options = useMemo(
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
  useEffect(() => {
    if (state !== null) {
      setPreviousPageName(state.previousPageName);
    }
  }, [setPreviousPageName, state]);
  useEffect(() => {
    if (
      fitBoundsCallCountRef.current < 2 &&
      map !== null &&
      data !== undefined
    ) {
      const bounds = new window.google.maps.LatLngBounds();
      for (const { lat, lon } of [data.departureAirport, data.arrivalAirport]) {
        bounds.extend(new window.google.maps.LatLng({ lat, lng: lon }));
      }
      const { tracklog, waypoints } = data;
      if (waypoints !== undefined) {
        for (const [lng, lat] of waypoints) {
          bounds.extend(new window.google.maps.LatLng({ lat, lng }));
        }
      }
      if (tracklog !== undefined) {
        for (const {
          coord: [lng, lat],
        } of tracklog) {
          bounds.extend(new window.google.maps.LatLng({ lat, lng }));
        }
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 175,
          left: window.innerWidth < 768 ? 25 : 408,
          right: 25,
          bottom: window.innerWidth < 768 ? 320 : 25,
        });
        fitBoundsCallCountRef.current += 1;
      }
    }
  }, [data, map]);
  if (flightId === undefined) return null;
  return (
    <div className="relative flex-1">
      {isLoaded && data !== undefined && (
        <GoogleMap
          mapContainerStyle={{
            height: '100%',
            width: '100%',
          }}
          zoom={3}
          options={options}
          onLoad={map => {
            setMap(map);
          }}
        >
          {[data.departureAirport, data.arrivalAirport].map(
            ({ id, lat, lon, iata }) => (
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
                            strokeWeight: 2,
                            strokeOpacity: 1,
                          }
                        : null,
                    zIndex: 30,
                  }}
                />
              </>
            ),
          ) ?? null}
          {(() => {
            const isCurrentFlight = [
              'DEPARTED_TAXIING',
              'EN_ROUTE',
              'ARRIVED_TAXIING',
            ].includes(data.flightStatus);
            const lastTracklogItem =
              data.tracklog !== undefined && data.tracklog.length > 2
                ? data.tracklog[data.tracklog.length - 3]
                : null;
            const currentTracklogItem =
              data.tracklog !== undefined && data.tracklog.length > 1
                ? data.tracklog[data.tracklog.length - 2]
                : null;
            const lastAlt =
              lastTracklogItem !== null
                ? Math.round(lastTracklogItem.alt ?? 0)
                : null;
            const currentAlt =
              currentTracklogItem !== null
                ? Math.round(currentTracklogItem.alt ?? 0)
                : null;
            const currentSpeed =
              currentTracklogItem !== null
                ? Math.round(currentTracklogItem.gs ?? 0)
                : null;
            const altChangeString =
              lastAlt !== null && currentAlt !== null
                ? getAltChangeString(lastAlt, currentAlt)
                : null;
            let lastAltitude: number | null = null;
            return (
              <>
                {data.flightState !== 'UPCOMING' &&
                data.tracklog === undefined ? (
                  <PolylineF
                    options={{
                      geodesic: true,
                      strokeOpacity: 0.75,
                      strokeColor: getAltitudeColor(0.8),
                      strokeWeight: 3,
                      zIndex: isCurrentFlight ? 20 : 10,
                    }}
                    path={[
                      {
                        lat: data.departureAirport.lat,
                        lng: data.departureAirport.lon,
                      },
                      {
                        lat: isCurrentFlight
                          ? data.estimatedLocation.lat
                          : data.arrivalAirport.lat,
                        lng: isCurrentFlight
                          ? data.estimatedLocation.lng
                          : data.arrivalAirport.lon,
                      },
                    ]}
                  />
                ) : null}
                {data.tracklog?.map(({ alt, coord }, index, allItems) => {
                  const prevItem = allItems[index - 1];
                  if (prevItem === undefined) return null;
                  if (alt !== null) {
                    lastAltitude = alt;
                  }
                  return (
                    <PolylineF
                      key={index}
                      options={{
                        strokeOpacity: 0.75,
                        strokeColor: getAltitudeColor(
                          lastAltitude !== null ? lastAltitude / 450 : 0,
                        ),
                        strokeWeight: 3,
                        zIndex: isCurrentFlight ? 20 : 10,
                        geodesic: true,
                      }}
                      path={[
                        {
                          lat: prevItem.coord[1],
                          lng: prevItem.coord[0],
                        },
                        { lat: coord[1], lng: coord[0] },
                      ]}
                    />
                  );
                }) ?? null}
                {data.flightStatus !== 'ARRIVED' ? (
                  <PolylineF
                    visible
                    options={{
                      strokeOpacity: isDarkMode ? 0.5 : 1,
                      strokeColor: isDarkMode ? 'lightblue' : 'white',
                      strokeWeight: 2,
                      zIndex: isCurrentFlight ? 15 : 5,
                      geodesic: true,
                    }}
                    path={
                      data.waypoints?.map(([lng, lat]) => ({
                        lat,
                        lng,
                      })) ?? []
                    }
                  />
                ) : null}
                {data.flightStatus === 'EN_ROUTE' ? (
                  <OverlayViewF
                    position={{
                      lat: data.estimatedLocation.lat,
                      lng: data.estimatedLocation.lng,
                    }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={(width, height) => ({
                      x: -(width / 2),
                      y: -(height / 2),
                    })}
                    zIndex={100}
                  >
                    <Tooltip
                      className="opacity-75"
                      color={TOOLTIP_COLORS[data.delayStatus]}
                      open
                    >
                      <TooltipContent className="flex items-center gap-1 font-mono">
                        <div className="flex flex-col">
                          <span className="flex gap-1 font-bold">
                            {data.callsign ??
                              `${data.airline?.icao}${data.flightNumber}`}
                          </span>
                          <span className="flex gap-1 text-xs">
                            <span>
                              {currentAlt != null
                                ? `FL${currentAlt < 10 ? '0' : ''}${currentAlt < 100 ? '0' : ''}${currentAlt < 0 ? '0' : currentAlt}`
                                : null}
                            </span>
                            <span>{currentSpeed}</span>
                            <span className="font-bold">{altChangeString}</span>
                          </span>
                        </div>
                      </TooltipContent>
                      <Button
                        size="sm"
                        shape="circle"
                        color="ghost"
                        title={`@${data.user.username}`}
                      >
                        <PlaneSolidIcon
                          className={classNames('h-6 w-6', aircraftColor)}
                          style={{
                            transform: `rotate(${Math.round(data.estimatedHeading - 90)}deg)`,
                          }}
                        />
                        <span className="sr-only">{`@${data.user.username}`}</span>
                      </Button>
                    </Tooltip>
                  </OverlayViewF>
                ) : null}
              </>
            );
          })()}
        </GoogleMap>
      )}
      <div className="rounded-box bg-base-100/80 absolute bottom-1 left-1 mt-24 flex h-[40%] w-[calc(100%-8px)] backdrop-blur-sm md:top-1 md:h-[calc(100%-104px)] md:w-[390px]">
        <div
          className={classNames(
            'rounded-box flex flex-1 flex-col gap-4 overflow-y-scroll p-4',
            data !== undefined &&
              (theme === AppTheme.LOFI
                ? CARD_COLORS_LOFI[data.delayStatus]
                : CARD_COLORS[data.delayStatus]),
            data !== undefined &&
              `border-2 ${
                theme === AppTheme.LOFI
                  ? CARD_BORDER_COLORS_LOFI[data.delayStatus]
                  : CARD_BORDER_COLORS[data.delayStatus]
              }`,
          )}
        >
          <FlightInfo flightId={flightId} />
          <OnTimePerformanceChart flightId={flightId} />
          <WeatherInfo flightId={flightId} />
          <FlightChangelogTable flightId={flightId} />
        </div>
      </div>
    </div>
  );
};
