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
import { Avatar, Button, Link, Tooltip, TooltipContent } from 'stratosphere-ui';

import {
  AirportLabelOverlay,
  FlightTimesDisplay,
  PlaneSolidIcon,
  RightArrowIcon,
} from '../../common/components';
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
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
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
      const scrollThreshold = Math.floor(window.innerHeight / 2) - 305;
      setIsMapCollapsed(prevIsMapCollapsed =>
        prevIsMapCollapsed
          ? container.scrollTop > 0
          : container.scrollTop >= scrollThreshold,
      );
      setIsScrolled(container.scrollTop >= scrollThreshold + 200);
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
              ? isMapCollapsed
                ? Math.floor(window.innerHeight / 2) + 80 + 20
                : 320
              : 20,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, isMapCollapsed, map]);
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
          'pointer-events-none absolute bottom-0 left-1 h-[calc(50vh+80px)] w-[calc(100%-8px)] overflow-y-scroll pb-1 md:top-1 md:mt-24 md:h-[calc(100%-104px)] md:w-[390px] md:pb-0',
          HIDE_SCROLLBAR_CLASSNAME,
        )}
        ref={scrollContainerRef}
      >
        {data?.airline !== undefined && data?.airline !== null && isScrolled ? (
          <div className="bg-base-100 sticky top-0 left-0 z-10 w-full shadow-lg">
            <div
              className={classNames(
                'flex justify-between gap-2 border-x-2 p-2',
                theme === AppTheme.LOFI
                  ? CARD_COLORS_LOFI[data.delayStatus]
                  : CARD_COLORS[data.delayStatus],
                theme === AppTheme.LOFI
                  ? CARD_BORDER_COLORS_LOFI[data.delayStatus]
                  : CARD_BORDER_COLORS[data.delayStatus],
              )}
            >
              <div className="flex h-full w-[150px] flex-col gap-1 overflow-hidden">
                <div className="flex flex-1 gap-4">
                  <div className="flex h-[20px] w-[100px]">
                    {data.airline?.logo !== null &&
                    data.airline?.logo !== undefined ? (
                      <a
                        className="flex flex-1 items-center"
                        href={data.airline.wiki ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          alt={`${data.airline.name} Logo`}
                          className="max-h-full max-w-full"
                          src={data.airline.logo}
                        />
                      </a>
                    ) : null}
                  </div>
                  <Link
                    className="w-[60px] font-mono text-sm text-nowrap opacity-90"
                    hover
                    href={
                      data.flightAwareLink !== null
                        ? `https://www.flightaware.com${data.flightAwareLink}`
                        : `https://www.flightaware.com/live/flight/${data.airline?.icao}${data.flightNumber}`
                    }
                    target="_blank"
                  >
                    <span>{data.airline?.iata}</span>{' '}
                    <span className="font-semibold">{data.flightNumber}</span>
                  </Link>
                </div>
                <div className="text-xs font-semibold opacity-80 md:text-center md:text-sm">
                  {data.outDateLocal}
                </div>
                <div className="flex items-center gap-1 overflow-hidden">
                  <Avatar
                    alt={data.user.username}
                    src={data.user.avatar}
                    shapeClassName="w-4 h-4 rounded-full"
                  />
                  <span className="truncate text-sm font-semibold opacity-90">
                    {data.user.username}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <div className="flex w-0 flex-1 flex-col items-center">
                  <div className="font-mono text-xl font-bold">
                    {data.departureAirport.iata}
                  </div>
                  <FlightTimesDisplay
                    className="justify-center"
                    data={{
                      delayStatus: data.departureDelayStatus,
                      actualValue: data.outTimeActualValue,
                      value: data.outTimeValue,
                      actualLocal: data.outTimeActualLocal,
                      local: data.outTimeLocal,
                      actualDaysAdded: data.outTimeActualDaysAdded,
                      daysAdded: 0,
                    }}
                  />
                </div>
                <RightArrowIcon className="h-4 w-4" />
                <div className="flex w-0 flex-1 flex-col items-center">
                  <div className="flex gap-1 font-mono text-xl font-bold">
                    <span
                      className={classNames(
                        data.diversionAirport !== null &&
                          'line-through opacity-60',
                      )}
                    >
                      {data.arrivalAirport.iata}
                    </span>
                    {data.diversionAirport !== null ? (
                      <span>{data.diversionAirport.iata}</span>
                    ) : null}
                  </div>
                  <FlightTimesDisplay
                    className="justify-center"
                    data={{
                      delayStatus: data.arrivalDelayStatus,
                      actualValue: data.inTimeActualValue,
                      value: data.inTimeValue,
                      actualLocal: data.inTimeActualLocal,
                      local: data.inTimeLocal,
                      actualDaysAdded: data.inTimeActualDaysAdded,
                      daysAdded: data.inTimeDaysAdded,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="rounded-box bg-base-100/80 mt-[calc(50vh-305px+80px)] backdrop-blur-sm md:mt-0 md:h-full">
          <div
            className={classNames(
              'rounded-box pointer-events-auto flex flex-1 flex-col gap-3 overflow-y-scroll p-2 md:h-full',
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
            <WeatherInfo flightId={flightId} />
            {isLoggedIn ? <FlightHistory flightId={flightId} /> : null}
            <FlightChangelogTable flightId={flightId} />
          </div>
        </div>
      </div>
    </div>
  );
};
