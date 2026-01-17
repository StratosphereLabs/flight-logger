import { GoogleMap } from '@react-google-maps/api';
import { useStatsigClient } from '@statsig/react-bindings';
import classNames from 'classnames';
import groupBy from 'lodash.groupby';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from 'stratosphere-ui';

import {
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
  useFlightPageScrollContainer,
  useGoogleMapInitialization,
  useWeatherRadarLayer,
} from '../../common/hooks';
import { useMainLayoutStore } from '../../layouts/MainLayout/mainLayoutStore';
import { getIsLoggedIn, useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export interface AircraftPageNavigationState {
  previousPageName: string;
}

export const Aircraft = (): JSX.Element | null => {
  const { client } = useStatsigClient();
  const { icao24 } = useParams();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { data } = trpc.flights.getAircraftFlight.useQuery(
    { icao24: icao24 ?? '' },
    {
      enabled: icao24 !== undefined,
      refetchInterval: data => {
        if (data === undefined) return false;
        return data.flightState === 'CURRENT' ? 5000 : 60000;
      },
    },
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
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
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
  const { isLoaded, map, setMap } = useGoogleMapInitialization();
  useWeatherRadarLayer(map, data?.timestamp ?? null);
  useEffect(() => {
    if (state !== null) {
      setPreviousPageName(state.previousPageName);
    }
  }, [setPreviousPageName, state]);
  useEffect(() => {
    client.logEvent('aircraft_page_viewed', icao24);
  }, [client, icao24]);
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
  const { isScrolled, scrollContainerRef } = useFlightPageScrollContainer({
    setIsMapCollapsed,
  });
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
          <AirportMarkersOverlay
            airports={allAirports}
            showDistance={isEnRouteFlight}
          />
          {allFlights.map(flightData => (
            <FlightTrackOverlay key={flightData.id} data={flightData} />
          ))}
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
      </div>
      <FlightDetailsPanel
        data={data}
        isScrolled={isScrolled}
        scrollContainerRef={scrollContainerRef}
      >
        <FlightInfo data={data} />
        <FlightAircraftDetails data={data} showFlightActivity />
        <FlightDetailedTimetable data={data} />
        <OnTimePerformanceChart flightId={data?.id} />
        <WeatherInfo flightId={data?.id} />
        {isLoggedIn ? <FlightHistory flightId={data?.id} /> : null}
        <FlightChangelogTable flightId={data?.id} />
      </FlightDetailsPanel>
    </div>
  );
};
