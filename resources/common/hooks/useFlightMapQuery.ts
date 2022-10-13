import { airport } from '@prisma/client';

export interface Route {
  departureAirport: airport;
  arrivalAirport: airport;
}

export interface FlightMapResponse {
  airports: airport[];
  routes: Route[];
}
