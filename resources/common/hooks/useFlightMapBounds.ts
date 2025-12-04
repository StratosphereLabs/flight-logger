import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
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
        bounds.extend(
          new window.google.maps.LatLng({
            lat: data.estimatedLocation.lat,
            lng: data.estimatedLocation.lng,
          }),
        );
        if (data.oppositeBoundLocationDeparture !== null) {
          bounds.extend(
            new window.google.maps.LatLng({
              lat: data.oppositeBoundLocationDeparture.lat,
              lng: data.oppositeBoundLocationDeparture.lng,
            }),
          );
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
        bounds.extend(
          new window.google.maps.LatLng({
            lat: data.estimatedLocation.lat,
            lng: data.estimatedLocation.lng,
          }),
        );
        if (data.oppositeBoundLocationArrival !== null) {
          bounds.extend(
            new window.google.maps.LatLng({
              lat: data.oppositeBoundLocationArrival.lat,
              lng: data.oppositeBoundLocationArrival.lng,
            }),
          );
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
          if (data.oppositeBoundLocationDeparture !== null) {
            bounds.extend(
              new window.google.maps.LatLng({
                lat: data.oppositeBoundLocationDeparture.lat,
                lng: data.oppositeBoundLocationDeparture.lng,
              }),
            );
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
          if (data.oppositeBoundLocationArrival !== null) {
            bounds.extend(
              new window.google.maps.LatLng({
                lat: data.oppositeBoundLocationArrival.lat,
                lng: data.oppositeBoundLocationArrival.lng,
              }),
            );
          }
        }
      }
    }
    return bounds;
  }, [data, getFullRouteBounds]);
  const padding = useMemo(
    () => ({
      top: 150,
      left: window.innerWidth < 768 ? 75 : 469,
      right: 75,
      bottom:
        window.innerWidth < 768
          ? isMapCollapsed
            ? Math.floor(window.innerHeight / 2) + 80 + 20
            : 354
          : 54,
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
