export type WithRequiredNonNull<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>;
};

export interface LatLng {
  lat: number;
  lng: number;
}
