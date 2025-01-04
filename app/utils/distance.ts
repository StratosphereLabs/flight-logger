import vincenty from 'node-vincenty';

import { METERS_IN_MILE } from '../constants';
import { type Coordinates } from './coordinates';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const distanceMeters = vincenty.distVincenty(lat1, lon1, lat2, lon2).distance;
  return distanceMeters / METERS_IN_MILE;
};

export const getMidpoint = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): Coordinates => {
  const { distance, initialBearing } = vincenty.distVincenty(
    lat1,
    lon1,
    lat2,
    lon2,
  );
  const { lat, lon } = vincenty.destVincenty(
    lat1,
    lon1,
    initialBearing,
    distance / 2,
  );
  return { lat, lng: lon };
};

export const getBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => vincenty.distVincenty(lat1, lon1, lat2, lon2).initialBearing;

export const getProjectedCoords = (
  lat1: number,
  lon1: number,
  d: number,
  brng: number,
): Coordinates => {
  const distanceMeters = d * METERS_IN_MILE;
  const { lat, lon } = vincenty.destVincenty(lat1, lon1, brng, distanceMeters);
  return { lat, lng: lon };
};

export const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const toDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};
