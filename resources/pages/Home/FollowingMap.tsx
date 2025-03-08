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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading } from 'stratosphere-ui';

import {
  AirportLabelOverlay,
  PlaneSolidIcon,
  PlusIcon,
  RightArrowIcon,
} from '../../common/components';
import { TOOLTIP_COLORS } from '../../common/constants';
import { darkModeStyle, lightModeStyle } from '../../common/mapStyle';
import { useIsDarkMode } from '../../stores';
import { getAltitudeColor } from '../../utils/colors';
import { trpc } from '../../utils/trpc';
import { type ProfilePageNavigationState } from '../Profile';
import { getAirportsData } from '../Profile/components/Map/utils';
import { FlightRow } from './FlightRow';
import { DEFAULT_COORDINATES } from './constants';
import {
  getFollowingFlightData,
  sortByArrivalTimeDesc,
  sortByDepartureTimeAsc,
} from './utils';

export const FollowingMap = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(
    null,
  );
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const isItemSelected = selectedAirportId !== null;
  const navigate = useNavigate();
  const [center, setCenter] = useState(DEFAULT_COORDINATES);
  const isDarkMode = useIsDarkMode();
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
  const aircraftColor = useMemo(
    () => (isDarkMode ? 'text-blue-500' : 'text-[#0000ff]'),
    [isDarkMode],
  );
  const { data, isLoading } = trpc.flights.getFollowingFlights.useQuery(
    undefined,
    {
      refetchInterval: 10000,
      select: flightResult => {
        const flights = flightResult.flights.map(
          getFollowingFlightData({ hoverAirportId, selectedAirportId }),
        );
        const selectedFlight = flightResult.flights.find(
          ({ id }) => id === selectedFlightId,
        );
        const groupedFlights = groupBy(
          flights.filter(({ isSelected }) =>
            selectedAirportId === null ? true : isSelected,
          ) ?? [],
          ({ flightState }) => flightState,
        );
        return {
          ...flightResult,
          airports: getAirportsData(
            flightResult.flights.map(({ departureAirport, arrivalAirport }) => [
              departureAirport,
              arrivalAirport,
            ]),
            selectedAirportId,
            selectedFlight,
          ),
          flights,
          groupedFlights,
        };
      },
    },
  );
  useEffect(() => {
    if (data?.centerpoint !== undefined) setCenter(data.centerpoint);
  }, [data?.centerpoint]);
  useEffect(() => {
    if (
      map !== null &&
      data !== undefined &&
      (selectedAirportId !== null || selectedFlightId !== null)
    ) {
      const bounds = new window.google.maps.LatLngBounds();
      for (const { lat, lon, hasSelectedRoute } of data.airports) {
        if (hasSelectedRoute) {
          bounds.extend(new window.google.maps.LatLng({ lat, lng: lon }));
        }
      }
      for (const { id, isSelected, tracklog, waypoints } of data.flights) {
        if (isSelected || id === selectedFlightId) {
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
        }
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 165,
          left: 25,
          right: 25,
          bottom: 25,
        });
      }
    }
  }, [data, map, selectedAirportId, selectedFlightId]);
  useEffect(() => {
    const listener: (this: Window, ev: KeyboardEvent) => void = event => {
      if (event.key === 'Escape') {
        setSelectedAirportId(null);
        setSelectedFlightId(null);
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full">
        <div className="pointer-events-auto absolute left-2 top-2 z-10 mt-16 flex min-w-[150px] flex-col items-start rounded-box bg-base-100/50 px-3 py-2 backdrop-blur-sm">
          <span className="text-lg font-semibold">Live Map</span>
          <span className="text-sm opacity-75">
            {data?.groupedFlights.CURRENT?.length ?? '0'} Flight
            {data?.groupedFlights.CURRENT?.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="h-[65vh] w-full">
          {isLoaded && data !== undefined ? (
            <GoogleMap
              mapContainerStyle={{
                height: '100%',
                width: '100%',
              }}
              zoom={3}
              options={options}
              onClick={() => {
                setSelectedAirportId(null);
                setSelectedFlightId(null);
              }}
              onLoad={map => {
                setMap(map);
              }}
            >
              {Object.values(data.airports)?.map(
                ({ id, lat, lon, iata, hasSelectedRoute }) => {
                  const isActive =
                    selectedAirportId === id || hoverAirportId === id;
                  const isFocused =
                    isActive || hasSelectedRoute || selectedAirportId === null;
                  return (
                    <>
                      <AirportLabelOverlay
                        iata={iata}
                        isFocused={isFocused}
                        position={{ lat, lng: lon }}
                        show
                      />
                      <MarkerF
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
                },
              ) ?? null}
              {data.flights.map(
                (
                  {
                    id,
                    isSelected,
                    isHover,
                    user,
                    airline,
                    flightNumber,
                    departureAirport,
                    arrivalAirport,
                    delayStatus,
                    estimatedLocation,
                    estimatedHeading,
                    flightState,
                    flightStatus,
                    tracklog,
                    waypoints,
                  },
                  index,
                ) => {
                  const isCurrentFlight = [
                    'DEPARTED_TAXIING',
                    'EN_ROUTE',
                    'ARRIVED_TAXIING',
                  ].includes(flightStatus);
                  const isFocused = isSelected || isHover || isCurrentFlight;
                  let lastAltitude: number | null = null;
                  return (
                    <>
                      {flightState !== 'UPCOMING' && tracklog === undefined ? (
                        <PolylineF
                          key={index}
                          options={{
                            geodesic: true,
                            strokeOpacity:
                              isSelected || isHover
                                ? 1
                                : !isItemSelected
                                  ? 0.75
                                  : 0.1,
                            strokeColor: getAltitudeColor(0.8),
                            strokeWeight: isFocused ? 3 : 2,
                            zIndex: isCurrentFlight ? 20 : 10,
                          }}
                          path={[
                            {
                              lat: departureAirport.lat,
                              lng: departureAirport.lon,
                            },
                            {
                              lat: isCurrentFlight
                                ? estimatedLocation.lat
                                : arrivalAirport.lat,
                              lng: isCurrentFlight
                                ? estimatedLocation.lng
                                : arrivalAirport.lon,
                            },
                          ]}
                        />
                      ) : null}
                      {tracklog?.map(({ alt, coord }, index, allItems) => {
                        const prevItem = allItems[index - 1];
                        if (prevItem === undefined) return null;
                        if (alt !== null) {
                          lastAltitude = alt;
                        }
                        return (
                          <PolylineF
                            key={index}
                            options={{
                              strokeOpacity:
                                isSelected || isHover
                                  ? 1
                                  : !isItemSelected
                                    ? 0.75
                                    : 0.1,
                              strokeColor: getAltitudeColor(
                                lastAltitude !== null ? lastAltitude / 450 : 0,
                              ),
                              strokeWeight: isFocused ? 3 : 2,
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
                      {flightStatus !== 'ARRIVED' ? (
                        <PolylineF
                          visible
                          key={index}
                          options={{
                            strokeOpacity:
                              isSelected || isHover
                                ? 0.75
                                : !isItemSelected
                                  ? isDarkMode
                                    ? 0.5
                                    : 1
                                  : 0.1,
                            strokeColor: isDarkMode ? 'lightblue' : 'white',
                            strokeWeight: 2,
                            zIndex: isCurrentFlight ? 15 : 5,
                            geodesic: true,
                          }}
                          path={
                            waypoints?.map(([lng, lat]) => ({
                              lat,
                              lng,
                            })) ?? []
                          }
                        />
                      ) : null}
                      {flightState === 'CURRENT' ? (
                        <OverlayViewF
                          key={id}
                          position={{
                            lat: estimatedLocation.lat,
                            lng: estimatedLocation.lng,
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
                              'tooltip tooltip-open font-semibold opacity-80',
                              TOOLTIP_COLORS[delayStatus],
                            )}
                            data-tip={`${airline?.icao}${flightNumber}`}
                          >
                            <Button
                              size="sm"
                              shape="circle"
                              color="ghost"
                              onClick={() => {
                                setSelectedFlightId(id);
                              }}
                              title={`@${user.username}`}
                            >
                              <PlaneSolidIcon
                                className={classNames('h-6 w-6', aircraftColor)}
                                style={{
                                  transform: `rotate(${Math.round(estimatedHeading - 90)}deg)`,
                                }}
                              />
                              <span className="sr-only">{`@${user.username}`}</span>
                            </Button>
                          </div>
                        </OverlayViewF>
                      ) : null}
                    </>
                  );
                },
              )}
            </GoogleMap>
          ) : null}
        </div>
      </div>
      <div className="flex w-full justify-center sm:p-2">
        <Card className="max-w-[1000px] flex-1 rounded-none bg-base-100 sm:rounded-box">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center p-3">
              <Loading />
            </div>
          ) : null}
          {!isLoading && data !== undefined ? (
            <div className="flex flex-col gap-2 p-2">
              {data?.groupedFlights.CURRENT?.sort(sortByDepartureTimeAsc).map(
                flight => (
                  <FlightRow
                    key={flight.id}
                    flight={flight}
                    onFlightClick={() => {
                      setSelectedFlightId(flight.id);
                    }}
                    onFlightClose={() => {
                      setSelectedFlightId(null);
                    }}
                    selectedFlightId={selectedFlightId}
                  />
                ),
              )}
              {data?.groupedFlights.UPCOMING?.sort(sortByDepartureTimeAsc).map(
                flight => (
                  <FlightRow
                    key={flight.id}
                    flight={flight}
                    onFlightClick={() => {
                      setSelectedFlightId(flight.id);
                    }}
                    onFlightClose={() => {
                      setSelectedFlightId(null);
                    }}
                    selectedFlightId={selectedFlightId}
                  />
                ),
              )}
              {data?.groupedFlights.COMPLETED?.sort(sortByArrivalTimeDesc).map(
                flight => (
                  <FlightRow
                    key={flight.id}
                    flight={flight}
                    onFlightClick={() => {
                      setSelectedFlightId(flight.id);
                    }}
                    onFlightClose={() => {
                      setSelectedFlightId(null);
                    }}
                    selectedFlightId={selectedFlightId}
                  />
                ),
              )}
              <div className="flex flex-1 flex-col items-center justify-center gap-4">
                {data.flights.length === 0 ? (
                  <article className="prose text-center">
                    <h3>No Flights Found</h3>
                    <p>Expecting to see something here?</p>
                  </article>
                ) : null}
                <div className="my-3 flex flex-wrap justify-center gap-4">
                  <Button
                    color="accent"
                    onClick={() => {
                      navigate('/profile', {
                        state: {
                          addFlight: true,
                        } as const as ProfilePageNavigationState,
                      });
                    }}
                  >
                    Add a Flight <PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    color="info"
                    onClick={() => {
                      navigate('/users');
                    }}
                  >
                    Find Users <RightArrowIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
};
