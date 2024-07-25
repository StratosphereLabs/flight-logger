import {
  GoogleMap,
  MarkerF,
  OverlayView,
  OverlayViewF,
  PolylineF,
  useJsApiLoader,
} from '@react-google-maps/api';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Loading } from 'stratosphere-ui';
import {
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
import { DEFAULT_COORDINATES } from './constants';
import { FlightRow } from './FlightRow';

export const FollowingMap = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(
    null,
  );
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
  const isItemSelected =
    selectedAirportId !== null || selectedFlightId !== null;
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
      refetchInterval: 60000,
    },
  );
  const numCurrentFlights = useMemo(
    () => data?.currentFlights.length ?? 0,
    [data?.currentFlights.length],
  );
  useEffect(() => {
    if (data?.centerpoint !== undefined) setCenter(data.centerpoint);
  }, [data?.centerpoint]);
  useEffect(() => {
    const listener: (this: Window, ev: KeyboardEvent) => void = event => {
      if (event.key === 'Escape') {
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
        <div className="pointer-events-auto absolute left-2 top-2 z-10 flex min-w-[150px] flex-col items-start rounded-box bg-base-100/50 px-3 py-2 backdrop-blur-sm">
          <span className="text-lg font-semibold">Live Map</span>
          <span className="text-sm opacity-75">
            {numCurrentFlights} Flight{numCurrentFlights !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="h-[50dvh] w-full">
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
            >
              {Object.values(data.airports)?.map(({ id, lat, lon }) => {
                const isActive =
                  selectedAirportId === id || hoverAirportId === id;
                const isFocused = isActive || !isItemSelected;
                return (
                  <MarkerF
                    visible
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
                              fillOpacity: isFocused ? 1 : 0.2,
                              scale: isActive ? 5 : 4,
                              strokeColor: 'black',
                              strokeWeight: isActive ? 2 : 1.5,
                              strokeOpacity: isFocused ? 1 : 0.2,
                            }
                          : null,
                      zIndex: selectedAirportId === null ? 10 : undefined,
                    }}
                  />
                );
              }) ?? null}
              {[
                ...data.completedFlights,
                ...data.currentFlights,
                ...data.upcomingFlights,
              ].map(
                (
                  {
                    id,
                    departureAirport,
                    arrivalAirport,
                    flightRadarStatus,
                    tracklog,
                    waypoints,
                  },
                  index,
                ) => {
                  const isSelected =
                    selectedAirportId !== null
                      ? [departureAirport.id, arrivalAirport.id].includes(
                          selectedAirportId,
                        )
                      : id === selectedFlightId;
                  const isHover =
                    hoverAirportId !== null
                      ? [departureAirport.id, arrivalAirport.id].includes(
                          hoverAirportId,
                        )
                      : false;
                  const isCurrentFlight =
                    flightRadarStatus !== null &&
                    [
                      'DEPARTED_TAXIING',
                      'EN_ROUTE',
                      'ARRIVED_TAXIING',
                    ].includes(flightRadarStatus);
                  const isFocused = isSelected || isHover || isCurrentFlight;
                  let lastAltitude: number | null = null;
                  return (
                    <>
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
                              strokeOpacity: isFocused
                                ? 0.75
                                : !isItemSelected
                                  ? 0.5
                                  : 0.25,
                              strokeColor: getAltitudeColor(
                                lastAltitude !== null ? lastAltitude / 450 : 0,
                              ),
                              strokeWeight: isFocused ? 3 : 2,
                              zIndex: 10,
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
                      {flightRadarStatus !== 'ARRIVED' ? (
                        <PolylineF
                          visible
                          key={index}
                          options={{
                            strokeOpacity: isFocused ? 0.5 : 0.25,
                            strokeColor: 'lightblue',
                            strokeWeight: isFocused ? 2 : 1.5,
                            zIndex: 5,
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
                    </>
                  );
                },
              )}
              {data.currentFlights.map(currentFlight => (
                <OverlayViewF
                  key={currentFlight.id}
                  position={{
                    lat: currentFlight.estimatedLocation.lat,
                    lng: currentFlight.estimatedLocation.lng,
                  }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={(width, height) => ({
                    x: -(width / 2),
                    y: -(height / 2),
                  })}
                >
                  <div
                    className={classNames(
                      'tooltip tooltip-open opacity-80',
                      TOOLTIP_COLORS[currentFlight.delayStatus],
                    )}
                    data-tip={`${currentFlight.airline?.icao}${currentFlight.flightNumber}`}
                  >
                    <Button
                      size="xs"
                      shape="circle"
                      color="ghost"
                      onClick={() => {
                        setSelectedFlightId(currentFlight.id);
                      }}
                    >
                      <PlaneSolidIcon
                        className={classNames('h-6 w-6', aircraftColor)}
                        style={{
                          transform: `rotate(${Math.round(currentFlight.estimatedHeading - 90)}deg)`,
                        }}
                      />
                    </Button>
                  </div>
                </OverlayViewF>
              )) ?? null}
            </GoogleMap>
          ) : null}
        </div>
      </div>
      <div className="flex w-full justify-center sm:p-3">
        <Card className="max-w-[1000px] flex-1 rounded-none bg-base-100 sm:rounded-box">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center p-3">
              <Loading />
            </div>
          ) : null}
          {!isLoading && data !== undefined ? (
            <>
              {data.currentFlights.length > 0 ? (
                <div className="flex flex-col gap-2 p-1">
                  <div className="text-center font-semibold">En Route</div>
                  {data.currentFlights.map(flight => (
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
                  ))}
                </div>
              ) : null}
              {data.upcomingFlights.length > 0 ? (
                <div className="flex flex-col gap-2 p-1">
                  <div className="text-center font-semibold">Scheduled</div>
                  {data.upcomingFlights.map(flight => (
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
                  ))}
                </div>
              ) : null}
              {data.completedFlights.length > 0 ? (
                <div className="flex flex-col gap-2 p-1">
                  <div className="text-center font-semibold">Arrived</div>
                  {data.completedFlights.map(flight => (
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
                  ))}
                </div>
              ) : null}
              <div className="flex flex-1 flex-col items-center justify-center gap-4">
                {data.completedFlights.length +
                  data.currentFlights.length +
                  data.upcomingFlights.length ===
                0 ? (
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
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
};
