import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { type FlightsRouterOutput } from '../../../app/routes/flights';

export interface UseFlightMapBoundsOptions {
  data: FlightsRouterOutput['getFlight'] | undefined;
  map: google.maps.Map | null;
}

export const useFlightMapBounds = ({
  data,
  map,
}: UseFlightMapBoundsOptions): {
  focusFullRoute: () => void;
  isEnRouteFlight: boolean;
  isFlightFocused: boolean;
  setIsFlightFocused: Dispatch<SetStateAction<boolean>>;
  setIsMapCollapsed: Dispatch<SetStateAction<boolean>>;
} => {
  const [isFlightFocused, setIsFlightFocused] = useState(false);
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const isEnRouteFlight =
    data !== undefined ? data.flightStatus === 'EN_ROUTE' : false;
  const getFullRouteBounds = useCallback(() => {
    const bounds = new window.google.maps.LatLngBounds();
    if (data !== undefined) {
      const arrivalAirport = data.diversionAirport ?? data.arrivalAirport;
      for (const { lat, lon } of [data.departureAirport, arrivalAirport]) {
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
    }
    return bounds;
  }, [data]);
  const getFlightFocusedBounds = useCallback(() => {
    const bounds = new window.google.maps.LatLngBounds();
    if (data !== undefined) {
      if (
        data.flightStatus === 'SCHEDULED' ||
        data.flightStatus === 'ARRIVED'
      ) {
        return getFullRouteBounds();
      }
      if (data.flightStatus === 'DEPARTED_TAXIING') {
        bounds.extend(
          new window.google.maps.LatLng({
            lat: data.departureAirport.lat,
            lng: data.departureAirport.lon,
          }),
        );
        const { tracklog } = data;
        if (tracklog !== undefined) {
          for (const {
            coord: [lng, lat],
          } of tracklog) {
            bounds.extend(new window.google.maps.LatLng({ lat, lng }));
          }
        }
      }
      const arrivalAirport = data.diversionAirport ?? data.arrivalAirport;
      if (data.flightStatus === 'LANDED_TAXIING') {
        bounds.extend(
          new window.google.maps.LatLng({
            lat: arrivalAirport.lat,
            lng: arrivalAirport.lon,
          }),
        );
        const { tracklog } = data;
        if (tracklog !== undefined) {
          for (const {
            coord: [lng, lat],
          } of tracklog) {
            bounds.extend(new window.google.maps.LatLng({ lat, lng }));
          }
        }
      }
      if (
        data.departureAirport.estimatedDistance !== undefined &&
        arrivalAirport.estimatedDistance !== undefined
      ) {
        const totalDistance =
          data.departureAirport.estimatedDistance +
          arrivalAirport.estimatedDistance;
        const percentFromOrigin =
          data.departureAirport.estimatedDistance / totalDistance;
        const percentFromDestination =
          arrivalAirport.estimatedDistance / totalDistance;
        if (percentFromOrigin >= 0.25 && percentFromDestination >= 0.25) {
          return getFullRouteBounds();
        }
        if (percentFromOrigin < 0.25) {
          bounds.extend(
            new window.google.maps.LatLng({
              lat: data.departureAirport.lat,
              lng: data.departureAirport.lon,
            }),
          );
          const { tracklog } = data;
          if (tracklog !== undefined) {
            for (const {
              coord: [lng, lat],
            } of tracklog) {
              bounds.extend(new window.google.maps.LatLng({ lat, lng }));
            }
          }
        }
        if (percentFromDestination < 0.25) {
          bounds.extend(
            new window.google.maps.LatLng({
              lat: arrivalAirport.lat,
              lng: arrivalAirport.lon,
            }),
          );
          bounds.extend(
            new window.google.maps.LatLng({
              lat: data.estimatedLocation.lat,
              lng: data.estimatedLocation.lng,
            }),
          );
        }
      }
    }
    return bounds;
  }, [data, getFullRouteBounds]);
  const focusFullRoute = useCallback(() => {
    if (map !== null) {
      const bounds = getFullRouteBounds();
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: 165,
          left: window.innerWidth < 768 ? 35 : 430,
          right: isEnRouteFlight ? 80 : 30,
          bottom:
            window.innerWidth < 768
              ? isMapCollapsed
                ? Math.floor(window.innerHeight / 2) + 80 + 20
                : 320
              : 20,
        });
      }
    }
  }, [getFullRouteBounds, isEnRouteFlight, isMapCollapsed, map]);
  const focusOnFlight = useCallback(() => {
    if (map !== null) {
      const bounds = getFlightFocusedBounds();
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          top: window.innerWidth < 768 && isMapCollapsed ? 165 : 205,
          left: window.innerWidth < 768 ? 75 : 470,
          right: isEnRouteFlight ? 80 : 30,
          bottom:
            window.innerWidth < 768
              ? isMapCollapsed
                ? Math.floor(window.innerHeight / 2) + 80 + 20
                : 360
              : 60,
        });
      }
    }
  }, [getFlightFocusedBounds, isEnRouteFlight, isMapCollapsed, map]);
  useEffect(() => {
    if (!isFlightFocused) {
      focusFullRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, isMapCollapsed, map]);
  useEffect(() => {
    if (
      data?.flightStatus === 'SCHEDULED' ||
      data?.flightStatus === 'ARRIVED'
    ) {
      setIsFlightFocused(false);
    } else if (isFlightFocused) {
      focusOnFlight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, focusOnFlight, isFlightFocused]);
  return {
    focusFullRoute,
    isEnRouteFlight,
    isFlightFocused,
    setIsFlightFocused,
    setIsMapCollapsed,
  };
};
