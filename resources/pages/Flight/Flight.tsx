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
  HIDE_SCROLLBAR_CLASSNAME,
  TOOLTIP_COLORS,
} from '../../common/constants';
import { useWeatherRadarLayer } from '../../common/hooks';
import { darkModeStyle, lightModeStyle } from '../../common/mapStyle';
import { getAltChangeString } from '../../common/utils';
import { useMainLayoutStore } from '../../layouts/MainLayout/mainLayoutStore';
import {
  AppTheme,
  getIsLoggedIn,
  useAuthStore,
  useIsDarkMode,
  useThemeStore,
} from '../../stores';
import { getAltitudeColor } from '../../utils/colors';
import { trpc } from '../../utils/trpc';
import { DEFAULT_COORDINATES } from '../Home/constants';
import { FlightChangelogTable } from './FlightChangelogTable';
import { FlightHistory } from './FlightHistory';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoggedIn = useAuthStore(getIsLoggedIn);
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
  useWeatherRadarLayer(map, data?.timestamp ?? null);
  useEffect(() => {
    map?.setValues({
      styles: isDarkMode ? darkModeStyle : lightModeStyle,
    });
  }, [isDarkMode, map]);
  useEffect(() => {
    map?.setCenter(center);
  }, [center, map]);
  useEffect(() => {
    if (state !== null) {
      setPreviousPageName(state.previousPageName);
    }
  }, [setPreviousPageName, state]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container === null) return;
    const handleScroll = (): void => {
      setIsScrolled(prevIsScrolled =>
        prevIsScrolled ? container.scrollTop > 0 : container.scrollTop >= 100,
      );
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    if (map !== null && data !== undefined) {
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
          top: 165,
          left: window.innerWidth < 768 ? 25 : 420,
          right: 30,
          bottom:
            window.innerWidth < 768
              ? isScrolled
                ? Math.floor(window.innerHeight / 2) + 20
                : 320
              : 20,
        });
      }
    }
  }, [data, isScrolled, map]);
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
          options={{
            minZoom: 2,
            fullscreenControl: false,
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false,
            gestureHandling: 'greedy',
            isFractionalZoomEnabled: true,
          }}
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
                (data.tracklog === undefined || data.tracklog.length === 0) ? (
                  <PolylineF
                    options={{
                      geodesic: true,
                      strokeOpacity: 1,
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
                        strokeOpacity: 1,
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
      <div
        className={classNames(
          'pointer-events-none absolute bottom-0 left-1 h-1/2 w-[calc(100%-8px)] overflow-y-scroll md:top-1 md:mt-[calc(50vh-300px)] md:h-[calc(100%-104px)] md:w-[390px]',
          HIDE_SCROLLBAR_CLASSNAME,
        )}
        ref={scrollContainerRef}
      >
        <div className="rounded-box bg-base-100/80 mt-[calc(50vh-300px)] backdrop-blur-sm md:mt-0 md:h-full">
          <div
            className={classNames(
              'rounded-box pointer-events-auto flex flex-1 flex-col gap-6 overflow-y-scroll p-3 md:h-full',
              HIDE_SCROLLBAR_CLASSNAME,
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
            {isLoggedIn ? <FlightHistory flightId={flightId} /> : null}
            <WeatherInfo flightId={flightId} />
            <FlightChangelogTable flightId={flightId} />
          </div>
        </div>
      </div>
    </div>
  );
};
