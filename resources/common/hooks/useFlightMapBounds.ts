import { type useNavigate, type useSearch } from '@tanstack/react-router';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { type AppRouter } from '../../router';
import { extendBounds } from '../utils';
import { useStateWithSearchParam } from './useStateWithSearchParam';

export interface UseFlightMapBoundsOptions {
  data: FlightsRouterOutput['getFlight'] | undefined;
  from: Parameters<typeof useSearch<AppRouter>>[0]['from'] &
    Parameters<typeof useNavigate<AppRouter>>[0];
  isMapCollapsed: boolean;
  map: google.maps.Map | null;
}

export interface UseFlightMapBoundsResult {
  focusFullRoute: () => void;
  isEnRouteFlight: boolean;
  isFlightFocused: boolean;
  setIsFlightFocused: Dispatch<SetStateAction<boolean>>;
}

export const useFlightMapBounds = ({
  data,
  from,
  isMapCollapsed,
  map,
}: UseFlightMapBoundsOptions): UseFlightMapBoundsResult => {
  const [isFlightFocused, setIsFlightFocused] = useStateWithSearchParam(
    false,
    'isFlightFocused',
    from,
  );
  const isEnRouteFlight = data?.flightStatus === 'EN_ROUTE';
  const getFullRouteBounds = useCallback(() => {
    const bounds = new window.google.maps.LatLngBounds();
    if (data === undefined) return bounds;
    const arrivalAirport = data.diversionAirport ?? data.arrivalAirport;
    extendBounds(bounds, data.departureAirport.lat, data.departureAirport.lon);
    extendBounds(bounds, arrivalAirport.lat, arrivalAirport.lon);
    if (data.waypoints !== undefined) {
      for (const [lng, lat] of data.waypoints) {
        extendBounds(bounds, lat, lng);
      }
    }
    if (data.tracklog !== undefined) {
      for (const {
        coord: [lng, lat],
      } of data.tracklog) {
        extendBounds(bounds, lat, lng);
      }
    }
    return bounds;
  }, [data]);
  const getFlightFocusedBounds = useCallback(() => {
    const bounds = new window.google.maps.LatLngBounds();
    if (data === undefined) return bounds;
    const { flightStatus, estimatedLocation, departureAirport, tracklog } =
      data;
    const arrivalAirport = data.diversionAirport ?? data.arrivalAirport;
    if (flightStatus === 'SCHEDULED' || flightStatus === 'ARRIVED') {
      return getFullRouteBounds();
    }
    if (flightStatus === 'DEPARTED_TAXIING') {
      extendBounds(bounds, departureAirport.lat, departureAirport.lon);
      extendBounds(bounds, estimatedLocation.lat, estimatedLocation.lng);
      if (data.oppositeBoundLocationDeparture !== null) {
        extendBounds(
          bounds,
          data.oppositeBoundLocationDeparture.lat,
          data.oppositeBoundLocationDeparture.lng,
        );
      }
    }
    if (flightStatus === 'LANDED_TAXIING') {
      extendBounds(bounds, arrivalAirport.lat, arrivalAirport.lon);
      extendBounds(bounds, estimatedLocation.lat, estimatedLocation.lng);
      if (data.oppositeBoundLocationArrival !== null) {
        extendBounds(
          bounds,
          data.oppositeBoundLocationArrival.lat,
          data.oppositeBoundLocationArrival.lng,
        );
      }
    }
    const departureDistance = departureAirport.estimatedDistance;
    const arrivalDistance = arrivalAirport.estimatedDistance;
    if (departureDistance !== undefined && arrivalDistance !== undefined) {
      const totalDistance = departureDistance + arrivalDistance;
      const percentFromOrigin = departureDistance / totalDistance;
      const percentFromDestination = arrivalDistance / totalDistance;
      if (percentFromOrigin >= 0.25 && percentFromDestination >= 0.25) {
        return getFullRouteBounds();
      }
      if (percentFromOrigin < 0.25) {
        extendBounds(bounds, departureAirport.lat, departureAirport.lon);
        if (tracklog !== undefined) {
          for (const {
            coord: [lng, lat],
          } of tracklog) {
            extendBounds(bounds, lat, lng);
          }
        }
        if (data.oppositeBoundLocationDeparture !== null) {
          extendBounds(
            bounds,
            data.oppositeBoundLocationDeparture.lat,
            data.oppositeBoundLocationDeparture.lng,
          );
        }
      }
      if (percentFromDestination < 0.25) {
        extendBounds(bounds, arrivalAirport.lat, arrivalAirport.lon);
        extendBounds(bounds, estimatedLocation.lat, estimatedLocation.lng);
        if (data.oppositeBoundLocationArrival !== null) {
          extendBounds(
            bounds,
            data.oppositeBoundLocationArrival.lat,
            data.oppositeBoundLocationArrival.lng,
          );
        }
      }
    }
    return bounds;
  }, [data, getFullRouteBounds]);
  const padding = useMemo(
    () => ({
      top: 164,
      left: window.innerWidth < 768 ? 75 : 469,
      right: 75,
      bottom:
        window.innerWidth < 768
          ? isMapCollapsed
            ? Math.floor(window.innerHeight / 2) + 100
            : 368
          : 68,
    }),
    [isMapCollapsed],
  );
  const focusFullRoute = useCallback(() => {
    if (map !== null) {
      const bounds = getFullRouteBounds();
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, padding);
      }
    }
  }, [getFullRouteBounds, map, padding]);
  const focusOnFlight = useCallback(() => {
    if (map !== null) {
      const bounds = getFlightFocusedBounds();
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, padding);
      }
    }
  }, [getFlightFocusedBounds, map, padding]);
  useEffect(() => {
    if (isFlightFocused && data?.flightStatus !== 'ARRIVED') {
      focusOnFlight();
    }
  }, [data?.flightStatus, focusOnFlight, isFlightFocused]);
  useEffect(() => {
    if (!isFlightFocused) {
      focusFullRoute();
    }
    /* Intentionally omitting focusFullRoute and isFlightFocused from dependencies:
     * We do not want to automatically focus on the full route when data is updated or when focus mode is
     * disabled.
     * Instead, we only want to focus on the full route when the flight ID changes or when the map is
     * initialized or collapsed.
     * Including them would not affect the effect and could cause unnecessary re-runs. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, isMapCollapsed, map]);
  useEffect(() => {
    if (data?.flightStatus === 'ARRIVED') {
      setIsFlightFocused(false);
      focusFullRoute();
    }
    /* Intentionally omitting setIsFlightFocused and focusFullRoute from dependencies:
     * setIsFlightFocused is wrapped in a custom useCallback (see lines 37-59), which is stable for our usage.
     * focusFullRoute depends on getFullRouteBounds, map, and padding, which may change, but for this effect,
     * we only want to run when flightStatus changes, not when map or padding changes.
     * Including them could cause unnecessary re-runs without benefit in this context. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.flightStatus]);
  return {
    focusFullRoute,
    isEnRouteFlight,
    isFlightFocused,
    setIsFlightFocused,
  };
};
