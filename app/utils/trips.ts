import { trip } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { FlightData, FlightTimeDataResult, getFlightTimeData } from './flights';

export type TripWithAirports = trip & {
  flights: FlightData[];
};

export type TripWithFlightData = trip & {
  flights: FlightTimeDataResult[];
};

export const transformTripData = (
  trip: TripWithAirports | null,
): TripWithFlightData => {
  if (trip === null) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Trip not found.',
    });
  }
  return {
    ...trip,
    flights: getFlightTimeData(trip.flights),
  };
};
