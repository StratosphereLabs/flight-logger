import {
  GoogleMap,
  MarkerF,
  OverlayView,
  OverlayViewF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import classNames from 'classnames';
import groupBy from 'lodash.groupby';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Avatar, Button, Link, Tooltip, TooltipContent } from 'stratosphere-ui';

import {
  AddTravelersModal,
  AddUserToFlightModal,
  AirportLabelOverlay,
  CollapseIcon,
  ExpandIcon,
  FlightAircraftDetails,
  FlightChangelogTable,
  FlightDetailedTimetable,
  FlightInfo,
  FlightTimesDisplay,
  OnTimePerformanceChart,
  PlaneSolidIcon,
  RightArrowIcon,
  RouteIcon,
  SleighIcon,
  WeatherInfo,
} from '../../common/components';
import {
  CARD_BORDER_COLORS,
  CARD_COLORS,
  CHRISTMAS_THEME_TOOLTIP_COLORS,
  HIDE_SCROLLBAR_CLASSNAME,
  TOOLTIP_COLORS,
} from '../../common/constants';
import { useFlightMapBounds, useWeatherRadarLayer } from '../../common/hooks';
import {
  christmasStyle,
  cyberPunkStyle,
  darkModeStyle,
  lightModeStyle,
} from '../../common/mapStyle';
import { useMainLayoutStore } from '../../layouts/MainLayout/mainLayoutStore';
import { AppTheme, useIsDarkMode, useThemeStore } from '../../stores';
import { getAltitudeColor } from '../../utils/colors';
import { trpc } from '../../utils/trpc';
import { DEFAULT_COORDINATES } from '../Home/constants';

export interface AircraftPageNavigationState {
  previousPageName: string;
}

export const Aircraft = (): JSX.Element | null => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const { icao24 } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { data } = trpc.flights.getAircraftFlight.useQuery(
    { icao24: icao24 ?? '' },
    { enabled: icao24 !== undefined, refetchInterval: 5000 },
  );
  const { data: flightActivityData } =
    trpc.flights.getAircraftOtherFlights.useQuery(
      {
        icao24: icao24 ?? '',
      },
      {
        enabled: icao24 !== undefined,
        refetchInterval: 60000,
      },
    );
  const { setPreviousPageName } = useMainLayoutStore();
  const { state } = useLocation() as {
    state: AircraftPageNavigationState | null;
  };
  const [center] = useState(DEFAULT_COORDINATES);
  const [isAddTravelerDialogOpen, setIsAddTravelerDialogOpen] = useState(false);
  const [isAddFlightDialogOpen, setIsAddFlightDialogOpen] = useState(false);
  const isDarkMode = useIsDarkMode();
  const { theme } = useThemeStore();
  const isActiveFlightCurrent =
    data !== undefined
      ? ['DEPARTED_TAXIING', 'EN_ROUTE', 'LANDED_TAXIING'].includes(
          data.flightStatus,
        )
      : false;
  const allFlights = useMemo(
    () => [
      ...(data !== undefined ? [data] : []),
      ...(flightActivityData?.groupedFlights.UPCOMING ?? []),
      ...(flightActivityData?.groupedFlights.COMPLETED ?? []),
    ],
    [data, flightActivityData?.groupedFlights],
  );
  const allAirports = useMemo(() => {
    const groupedAirports = groupBy(
      allFlights.flatMap(({ departureAirport, arrivalAirport }) => [
        departureAirport,
        arrivalAirport,
      ]),
      ({ id }) => id,
    );
    return Object.values(groupedAirports).map(([airport]) => airport);
  }, [allFlights]);
  useWeatherRadarLayer(map, data?.timestamp ?? null);
  useEffect(() => {
    map?.setValues({
      styles:
        theme === AppTheme.CYBERPUNK
          ? cyberPunkStyle
          : theme === AppTheme.CHRISTMAS
            ? christmasStyle
            : isDarkMode
              ? darkModeStyle
              : lightModeStyle,
    });
  }, [isDarkMode, map, theme]);
  useEffect(() => {
    map?.setCenter(center);
  }, [center, map]);
  useEffect(() => {
    if (state !== null) {
      setPreviousPageName(state.previousPageName);
    }
  }, [setPreviousPageName, state]);
  const {
    focusFullRoute,
    isEnRouteFlight,
    isFlightFocused,
    setIsFlightFocused,
    setIsMapCollapsed,
  } = useFlightMapBounds({
    data,
    map,
  });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (icao24 === undefined) return null;
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
          onDrag={() => {
            setIsFlightFocused(false);
          }}
          onLoad={map => {
            setMap(map);
          }}
        >
          {allAirports.map(({ id, lat, lon, iata, estimatedDistance }) => (
            <>
              <AirportLabelOverlay
                iata={iata}
                isFocused
                position={{ lat, lng: lon }}
                show
                distanceMi={isEnRouteFlight ? estimatedDistance : undefined}
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
          ))}
          {allFlights.map(flightData => {
            const isCurrentFlight = [
              'DEPARTED_TAXIING',
              'EN_ROUTE',
              'LANDED_TAXIING',
            ].includes(flightData.flightStatus);
            const currentTracklogItem =
              flightData.tracklog !== undefined &&
              flightData.tracklog.length > 1
                ? flightData.tracklog[flightData.tracklog.length - 2]
                : null;
            const currentSpeed =
              currentTracklogItem !== null
                ? Math.round(currentTracklogItem.gs ?? 0)
                : null;
            const shouldFlipIcon =
              flightData.estimatedHeading >= 180 ||
              flightData.estimatedHeading < 0;
            let lastAltitude: number | null = null;
            return (
              <>
                {flightData.flightState !== 'UPCOMING' &&
                (flightData.tracklog === undefined ||
                  flightData.tracklog.length === 0) ? (
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
                        lat: flightData.departureAirport.lat,
                        lng: flightData.departureAirport.lon,
                      },
                      {
                        lat: isCurrentFlight
                          ? flightData.estimatedLocation.lat
                          : flightData.arrivalAirport.lat,
                        lng: isCurrentFlight
                          ? flightData.estimatedLocation.lng
                          : flightData.arrivalAirport.lon,
                      },
                    ]}
                  />
                ) : null}
                {flightData.tracklog?.map(
                  ({ alt, coord, ground }, index, allItems) => {
                    const prevItem = allItems[index - 1];
                    if (prevItem === undefined) return null;
                    if (alt !== null) {
                      lastAltitude = alt;
                    }
                    return (
                      <PolylineF
                        key={index}
                        options={{
                          strokeOpacity: ground === true ? 0.5 : 1,
                          strokeColor:
                            ground === true
                              ? isDarkMode
                                ? 'white'
                                : 'darkgray'
                              : getAltitudeColor(
                                  lastAltitude !== null
                                    ? lastAltitude / 450
                                    : 0,
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
                  },
                ) ?? null}
                {flightData.flightStatus === 'SCHEDULED' ||
                flightData.flightStatus === 'DEPARTED_TAXIING' ? (
                  <PolylineF
                    visible
                    options={{
                      strokeOpacity: isDarkMode ? 0.5 : 1,
                      strokeColor: isDarkMode ? 'white' : 'gray',
                      strokeWeight: 2,
                      zIndex: isCurrentFlight ? 15 : 5,
                      geodesic: true,
                    }}
                    path={
                      flightData.waypoints?.map(([lng, lat]) => ({
                        lat,
                        lng,
                      })) ?? []
                    }
                  />
                ) : null}
                {['DEPARTED_TAXIING', 'EN_ROUTE', 'LANDED_TAXIING'].includes(
                  flightData.flightStatus,
                ) ? (
                  <OverlayViewF
                    position={{
                      lat: flightData.estimatedLocation.lat,
                      lng: flightData.estimatedLocation.lng,
                    }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={(width, height) => ({
                      x: -(width / 2),
                      y: -(height / 2),
                    })}
                    zIndex={100}
                  >
                    <Tooltip
                      className={classNames(
                        theme === AppTheme.CHRISTMAS &&
                          CHRISTMAS_THEME_TOOLTIP_COLORS[
                            flightData.delayStatus
                          ],
                      )}
                      color={
                        theme === AppTheme.CHRISTMAS
                          ? undefined
                          : TOOLTIP_COLORS[flightData.delayStatus]
                      }
                      open
                    >
                      <TooltipContent className="flex items-center gap-1 font-mono">
                        <div className="flex flex-col">
                          <span className="flex gap-1 font-bold">
                            {flightData.callsign ??
                              `${flightData.airline?.icao}${flightData.flightNumber}`}
                          </span>
                          <span className="flex gap-1 text-xs">
                            {currentTracklogItem?.ground === true ? (
                              <>
                                <span>GND {currentSpeed}</span>
                                <span>kts</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {flightData.estimatedAltitude !== null
                                    ? `FL${flightData.estimatedAltitude < 10 ? '0' : ''}${flightData.estimatedAltitude < 100 ? '0' : ''}${flightData.estimatedAltitude < 0 ? '0' : flightData.estimatedAltitude}`
                                    : null}
                                </span>
                                <span className="font-bold">
                                  {flightData.altChangeString}
                                </span>
                                <span>{currentSpeed}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </TooltipContent>
                      <Button
                        size="sm"
                        shape="circle"
                        color="ghost"
                        title={
                          flightData.user !== null
                            ? `@${flightData.user.username}`
                            : undefined
                        }
                      >
                        {theme === AppTheme.CHRISTMAS ? (
                          <SleighIcon
                            className={classNames(
                              'text-secondary h-7 w-7 brightness-80',
                              shouldFlipIcon && 'scale-x-[-1]',
                            )}
                            style={{
                              transform: `rotate(${Math.round(
                                (shouldFlipIcon
                                  ? -flightData.estimatedHeading
                                  : flightData.estimatedHeading) - 90,
                              )}deg)`,
                            }}
                          />
                        ) : (
                          <PlaneSolidIcon
                            className="text-primary h-6 w-6"
                            style={{
                              transform: `rotate(${Math.round(flightData.estimatedHeading - 90)}deg)`,
                            }}
                          />
                        )}
                        {/* {theme === AppTheme.HALLOWEEN ? (
                          <HalloweenIcon
                            className="text-primary h-7 w-7"
                            style={{
                              transform: `rotate(${Math.round(flightData.estimatedHeading)}deg)`,
                            }}
                          />
                        ) : (
                          <PlaneSolidIcon
                            className="text-primary h-6 w-6"
                            style={{
                              transform: `rotate(${Math.round(flightData.estimatedHeading - 90)}deg)`,
                            }}
                          />
                        )} */}
                        <span className="sr-only">
                          {flightData.user !== null
                            ? `@${flightData.user.username}`
                            : null}
                        </span>
                      </Button>
                    </Tooltip>
                  </OverlayViewF>
                ) : null}
              </>
            );
          })}
        </GoogleMap>
      )}
      <div className="absolute top-[100px] right-1 z-20 flex gap-2">
        <Button
          className="btn-sm sm:btn-md px-2"
          onClick={() => {
            setIsFlightFocused(false);
            focusFullRoute();
          }}
        >
          <RouteIcon className="h-6 w-6 rotate-90" />
        </Button>
        {isActiveFlightCurrent ? (
          <Button
            className={classNames(
              'btn-sm sm:btn-md px-2',
              isFlightFocused &&
                'outline-primary text-primary outline outline-2',
            )}
            onClick={() => {
              setIsFlightFocused(isFocused => !isFocused);
            }}
          >
            {isFlightFocused ? (
              <ExpandIcon className="h-6 w-6" />
            ) : (
              <CollapseIcon className="h-6 w-6" />
            )}
          </Button>
        ) : null}
      </div>
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
                CARD_COLORS[data.delayStatus],
                CARD_BORDER_COLORS[data.delayStatus],
              )}
            >
              <div className="flex h-full w-[150px] flex-col overflow-hidden">
                <div className="flex flex-1 gap-4">
                  <div className="flex h-[24px] w-[100px]">
                    {data.airline.logo !== null ? (
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
                {data.user !== null ? (
                  <div className="mt-1 flex items-center gap-1 overflow-hidden">
                    <Avatar
                      alt={data.user.username}
                      src={data.user.avatar}
                      shapeClassName="w-4 h-4 rounded-full"
                    />
                    <span className="truncate text-sm font-semibold opacity-90">
                      {data.user.username}
                    </span>
                  </div>
                ) : null}
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
              data !== undefined && CARD_COLORS[data.delayStatus],
              data !== undefined &&
                `border-2 ${CARD_BORDER_COLORS[data.delayStatus]}`,
            )}
          >
            <FlightInfo
              data={data}
              onAddTravelersClick={() => {
                setIsAddTravelerDialogOpen(true);
              }}
              onJoinFlightClick={() => {
                setIsAddFlightDialogOpen(true);
              }}
            />
            <FlightAircraftDetails data={data} showFlightActivity />
            <FlightDetailedTimetable data={data} />
            <OnTimePerformanceChart flightId={data?.id} />
            <WeatherInfo flightId={data?.id} />
            <FlightChangelogTable flightId={data?.id} />
          </div>
        </div>
      </div>
      {isAddTravelerDialogOpen && data !== undefined ? (
        <AddTravelersModal
          flightId={data.id}
          open={isAddTravelerDialogOpen}
          setOpen={setIsAddTravelerDialogOpen}
        />
      ) : null}
      {isAddFlightDialogOpen && data !== undefined ? (
        <AddUserToFlightModal
          flightId={data.id}
          open={isAddFlightDialogOpen}
          setOpen={setIsAddFlightDialogOpen}
        />
      ) : null}
    </div>
  );
};
