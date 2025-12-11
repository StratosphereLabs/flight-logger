import { GoogleMap } from '@react-google-maps/api';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from 'stratosphere-ui';

import {
  AddTravelersModal,
  AddUserToFlightModal,
  AirportMarkersOverlay,
  CollapseIcon,
  FlightAircraftDetails,
  FlightChangelogTable,
  FlightDetailedTimetable,
  FlightDetailsPanel,
  FlightHistory,
  FlightInfo,
  FlightTrackOverlay,
  OnTimePerformanceChart,
  RouteIcon,
  WeatherInfo,
} from '../../common/components';
import {
  useFlightMapBounds,
  useFlightPageScrollContainers,
  useGoogleMapInitialization,
  useWeatherRadarLayer,
} from '../../common/hooks';
import type { RefetchInterval } from '../../common/types';
import { useMainLayoutStore } from '../../layouts/MainLayout/mainLayoutStore';
import { getIsLoggedIn, useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export interface FlightPageNavigationState {
  previousPageName: string;
}

export const Flight = (): JSX.Element | null => {
  const { flightId } = useParams();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const [refetchInterval, setRefetchInterval] =
    useState<RefetchInterval>(60000);
  const { data } = trpc.flights.getFlight.useQuery(
    { id: flightId ?? '' },
    { enabled: flightId !== undefined, refetchInterval },
  );
  useEffect(() => {
    if (data !== undefined) {
      setRefetchInterval(data.flightState === 'CURRENT' ? 5000 : 60000);
    }
  }, [data]);
  const { setPreviousPageName } = useMainLayoutStore();
  const { state } = useLocation() as {
    state: FlightPageNavigationState | null;
  };
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isAddTravelerDialogOpen, setIsAddTravelerDialogOpen] = useState(false);
  const [isAddFlightDialogOpen, setIsAddFlightDialogOpen] = useState(false);
  const { isLoaded, map, setMap } = useGoogleMapInitialization();
  useWeatherRadarLayer(map, data?.timestamp ?? null);
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
  } = useFlightMapBounds({
    data,
    map,
    isMapCollapsed,
  });
  const { isScrolled, scrollContainerRef, scrollContainerMobileRef } =
    useFlightPageScrollContainers({
      setIsMapCollapsed,
    });
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
          onDrag={() => {
            setIsFlightFocused(false);
          }}
          onLoad={map => {
            setMap(map);
          }}
        >
          <AirportMarkersOverlay
            airports={[data.departureAirport, data.arrivalAirport]}
            showDistance={isEnRouteFlight}
          />
          <FlightTrackOverlay data={data} />
        </GoogleMap>
      )}
      <div className="absolute top-[100px] right-1 z-20 flex gap-1">
        <Button
          className="btn-sm sm:btn-md px-2"
          onClick={() => {
            setIsFlightFocused(false);
            focusFullRoute();
          }}
        >
          <RouteIcon className="h-6 w-6 rotate-90" />
        </Button>
        {data !== undefined && data.flightStatus !== 'ARRIVED' ? (
          <Button
            className={classNames(
              'btn-sm sm:btn-md',
              isFlightFocused
                ? 'border-primary text-primary box-border border border-2 px-[7px]'
                : 'px-2',
            )}
            onClick={() => {
              setIsFlightFocused(isFocused => !isFocused);
            }}
          >
            <CollapseIcon className="h-6 w-6" />
          </Button>
        ) : null}
      </div>
      <FlightDetailsPanel
        data={data}
        isScrolled={isScrolled}
        scrollContainerRef={scrollContainerRef}
        scrollContainerMobileRef={scrollContainerMobileRef}
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
        <FlightAircraftDetails data={data} showTrackMyAircraftButton />
        <FlightDetailedTimetable data={data} />
        <OnTimePerformanceChart flightId={flightId} />
        <WeatherInfo flightId={flightId} />
        {isLoggedIn ? <FlightHistory flightId={flightId} /> : null}
        <FlightChangelogTable flightId={flightId} />
      </FlightDetailsPanel>
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
