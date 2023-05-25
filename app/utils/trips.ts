import { trip } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { getDurationDays, getInFuture } from './datetime';
import { FlightData, FlightTimeDataResult, getFlightTimeData } from './flights';

export type TripWithAirports = trip & {
  flights: FlightData[];
};

export type TripWithFlightData = trip & {
  tripDuration: string;
  outDateISO: string;
  inFuture: boolean;
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
    tripDuration: getDurationDays({
      start: trip.flights[0].outTime,
      end: trip.flights[trip.flights.length - 1].inTime,
    }),
    outDateISO: formatInTimeZone(
      trip.outTime,
      trip.flights[0].departureAirport.timeZone,
      DATE_FORMAT_ISO,
    ),
    inFuture: getInFuture(trip.outTime),
    flights: getFlightTimeData(trip.flights),
  };
};
