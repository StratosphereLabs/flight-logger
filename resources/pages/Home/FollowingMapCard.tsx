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
import { darkModeStyle } from '../../common/mapStyle';
import { useIsDarkMode } from '../../stores';
import { trpc } from '../../utils/trpc';
import { type ProfilePageNavigationState } from '../Profile';
import { DEFAULT_COORDINATES } from './constants';
import { FlightRow } from './FlightRow';

export const FollowingMapCard = (): JSX.Element => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_CLIENT_ID as string,
    libraries: ['visualization'],
  });
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(
    null,
  );
  const [hoverAirportId, setHoverAirportId] = useState<string | null>(null);
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
      styles: isDarkMode ? darkModeStyle : undefined,
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
  return (
    <Card className="relative max-w-[1000px] flex-1 rounded-none bg-base-100 sm:rounded-box">
      <div className="pointer-events-auto absolute left-2 top-2 z-10 flex min-w-[150px] flex-col items-start rounded-box bg-base-100/50 px-3 py-2 backdrop-blur-sm">
        <span className="text-lg font-semibold">Live Map</span>
        <span className="text-sm opacity-75">
          {numCurrentFlights} Flight{numCurrentFlights !== 1 ? 's' : ''}
        </span>
      </div>
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="rounded-t-none sm:rounded-t-box"
          mapContainerStyle={{
            height: '50dvh',
            width: '100%',
          }}
          zoom={3}
          options={options}
          onClick={() => {
            setSelectedAirportId(null);
          }}
        >
          {Object.values(data?.airports ?? {})?.map(({ id, lat, lon }) => {
            const isActive = selectedAirportId === id || hoverAirportId === id;
            const isSelected =
              selectedAirportId !== null ? selectedAirportId === id : false;
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
                          fillOpacity:
                            isSelected || selectedAirportId === null ? 1 : 0.2,
                          scale: isActive ? 5 : 4,
                          strokeColor: 'black',
                          strokeWeight: isActive ? 2 : 1.5,
                          strokeOpacity:
                            isSelected || selectedAirportId === null ? 1 : 0.2,
                        }
                      : null,
                  zIndex: selectedAirportId === null ? 10 : undefined,
                }}
              />
            );
          }) ?? null}
          {[
            ...(data?.completedFlights ?? []),
            ...(data?.currentFlights ?? []),
            ...(data?.upcomingFlights ?? []),
          ].map(({ departureAirport, arrivalAirport, inFuture }, index) => {
            const isSelected =
              selectedAirportId !== null
                ? [departureAirport.id, arrivalAirport.id].includes(
                    selectedAirportId,
                  )
                : false;
            const isHover =
              hoverAirportId !== null
                ? [departureAirport.id, arrivalAirport.id].includes(
                    hoverAirportId,
                  )
                : false;
            const isActive = isSelected || isHover;
            return (
              <PolylineF
                visible
                key={index}
                options={{
                  strokeOpacity:
                    selectedAirportId === null || isSelected ? 0.75 : 0.1,
                  strokeColor: isActive ? 'blue' : inFuture ? 'white' : 'red',
                  strokeWeight: isActive ? 3 : 1.5,
                  zIndex: isActive ? 10 : inFuture ? 5 : undefined,
                  geodesic: true,
                }}
                path={[
                  { lat: departureAirport.lat, lng: departureAirport.lon },
                  { lat: arrivalAirport.lat, lng: arrivalAirport.lon },
                ]}
              />
            );
          })}
          {data?.currentFlights.map(currentFlight => (
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
              <Button size="xs" shape="circle" color="ghost">
                <PlaneSolidIcon
                  className={classNames('h-6 w-6', aircraftColor)}
                  style={{
                    transform: `rotate(${Math.round(currentFlight.estimatedHeading - 90)}deg)`,
                  }}
                />
              </Button>
            </OverlayViewF>
          )) ?? null}
        </GoogleMap>
      ) : null}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loading />
        </div>
      ) : null}
      {!isLoading && data !== undefined ? (
        <>
          {data.currentFlights.length > 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="text-center font-semibold">En Route</div>
              {data.currentFlights.map(flight => (
                <FlightRow
                  key={flight.id}
                  flight={flight}
                  onFlightClick={() => {
                    setSelectedFlightId(flight.id);
                  }}
                  selectedFlightId={selectedFlightId}
                />
              ))}
            </div>
          ) : null}
          {data.upcomingFlights.length > 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="text-center font-semibold">Scheduled</div>
              {data.upcomingFlights.map(flight => (
                <FlightRow
                  key={flight.id}
                  flight={flight}
                  onFlightClick={() => {
                    setSelectedFlightId(flight.id);
                  }}
                  selectedFlightId={selectedFlightId}
                />
              ))}
            </div>
          ) : null}
          {data.completedFlights.length > 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="text-center font-semibold">Arrived</div>
              {data.completedFlights.map(flight => (
                <FlightRow
                  key={flight.id}
                  flight={flight}
                  onFlightClick={() => {
                    setSelectedFlightId(flight.id);
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
  );
};
