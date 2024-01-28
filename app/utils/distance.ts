import { EARTH_RADIUS_NM } from '../constants';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
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
  return EARTH_RADIUS_NM * c;
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
): [number, number] => {
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
  return [toDegrees(lat2), toDegrees(lon2)];
};

export const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const toDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};
