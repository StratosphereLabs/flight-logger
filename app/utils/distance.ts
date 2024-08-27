import { EARTH_RADIUS_MI, EARTH_RADIUS_NM } from '../constants';
import { type Coordinates } from './coordinates';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  statuteMi?: boolean,
): number => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (statuteMi === true ? EARTH_RADIUS_MI : EARTH_RADIUS_NM) * c;
};

export const getMidpoint = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): Coordinates => {
  const Bx =
    Math.cos(toRadians(lat2)) * Math.cos(toRadians(lon2) - toRadians(lon1));
  const By =
    Math.cos(toRadians(lat2)) * Math.sin(toRadians(lon2) - toRadians(lon1));
  const lat3 = Math.atan2(
    Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)),
    Math.sqrt(
      (Math.cos(toRadians(lat1)) + Bx) * (Math.cos(toRadians(lat1)) + Bx) +
        By * By,
    ),
  );
  const lon3 = toRadians(lon1) + Math.atan2(By, Math.cos(toRadians(lat1)) + Bx);
  return {
    lat: toDegrees(lat3),
    lng: toDegrees(lon3),
  };
};

export const getBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  const θ = Math.atan2(y, x);
  return (toDegrees(θ) + 360) % 360;
};

export const getProjectedCoords = (
  lat1: number,
  lon1: number,
  d: number,
  brng: number,
): Coordinates => {
  const lat2 = Math.asin(
    Math.sin(toRadians(lat1)) * Math.cos(d / EARTH_RADIUS_NM) +
      Math.cos(toRadians(lat1)) *
        Math.sin(d / EARTH_RADIUS_NM) *
        Math.cos(toRadians(brng)),
  );
  const lon2 =
    toRadians(lon1) +
    Math.atan2(
      Math.sin(toRadians(brng)) *
        Math.sin(d / EARTH_RADIUS_NM) *
        Math.cos(toRadians(lat1)),
      Math.cos(d / EARTH_RADIUS_NM) -
        Math.sin(toRadians(lat1)) * Math.sin(lat2),
    );
  return {
    lat: toDegrees(lat2),
    lng: toDegrees(lon2),
  };
};

export const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const toDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};
