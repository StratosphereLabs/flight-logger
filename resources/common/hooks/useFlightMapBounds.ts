import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { extendBounds } from '../utils';

export interface UseFlightMapBoundsOptions {
  data: FlightsRouterOutput['getFlight'] | undefined;
  map: google.maps.Map | null;
  isMapCollapsed: boolean;
}

export interface UseFlightMapBoundsResult {
  focusFullRoute: () => void;
  isEnRouteFlight: boolean;
  isFlightFocused: boolean;
  setIsFlightFocused: Dispatch<SetStateAction<boolean>>;
}

export const useFlightMapBounds = ({
  data,
  map,
  isMapCollapsed,
}: UseFlightMapBoundsOptions): UseFlightMapBoundsResult => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialParams] = useState(searchParams);
  const [isFlightFocused, setIsFlightFocusedValue] = useState(
    initialParams.get('isFlightFocused') === 'true',
  );
  const setIsFlightFocused = useCallback(
    (value: SetStateAction<boolean>) => {
      setIsFlightFocusedValue(oldValue => {
        const newValue = typeof value === 'function' ? value(oldValue) : value;
        setSearchParams(
          oldSearchParams => {
            if (newValue) {
              return new URLSearchParams({
                ...Object.fromEntries(oldSearchParams),
                isFlightFocused: 'true',
              });
            } else {
              oldSearchParams.delete('isFlightFocused');
              return oldSearchParams;
            }
          },
          { replace: true },
        );
        return newValue;
      });
    },
    [setSearchParams],
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
    if (isFlightFocused) {
      focusOnFlight();
    }
  }, [focusOnFlight, isFlightFocused]);
  useEffect(() => {
    if (!isFlightFocused) {
      focusFullRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, isMapCollapsed, map]);
  useEffect(() => {
    if (data?.flightStatus === 'ARRIVED') {
      setIsFlightFocused(false);
      focusFullRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.flightStatus]);
  return {
    focusFullRoute,
    isEnRouteFlight,
    isFlightFocused,
    setIsFlightFocused,
  };
};
