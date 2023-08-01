export interface Coordinates {
  lat: number;
  lng: number;
}

export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const calculateCenterPoint = (
  coordinates: Coordinates[],
): Coordinates => {
  let x = 0;
  let y = 0;
  let z = 0;

  for (const coordinate of coordinates) {
    const latitudeRadians = degreesToRadians(coordinate.lat);
    const longitudeRadians = degreesToRadians(coordinate.lng);

    x += Math.cos(latitudeRadians) * Math.cos(longitudeRadians);
    y += Math.cos(latitudeRadians) * Math.sin(longitudeRadians);
    z += Math.sin(latitudeRadians);
  }

  const totalCoordinates = coordinates.length;
  x /= totalCoordinates;
  y /= totalCoordinates;
  z /= totalCoordinates;

  const centerLongitude = Math.atan2(y, x);
  const centerSquareRoot = Math.sqrt(x * x + y * y);
  const centerLatitude = Math.atan2(z, centerSquareRoot);

  return {
    lat: radiansToDegrees(centerLatitude),
    lng: radiansToDegrees(centerLongitude),
  };
};
