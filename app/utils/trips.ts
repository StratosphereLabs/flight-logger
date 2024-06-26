import { type trip, type user } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { getDurationDays, getInFuture } from './datetime';
import {
  type FlightData,
  type FlightTimeDataResult,
  flightIncludeObj,
  transformFlightData,
} from './flights';
import { excludeKeys } from './server';

export const tripIncludeObj = {
  user: true,
  flights: {
    include: flightIncludeObj,
    orderBy: {
      outTime: 'asc' as const,
    },
  },
};

export interface TripWithData extends trip {
  user: user;
  flights: FlightData[];
}

export interface TripResult extends trip {
  user: Omit<
    user,
    | 'admin'
    | 'password'
    | 'id'
    | 'pushNotifications'
    | 'passwordResetToken'
    | 'passwordResetAt'
  >;
  tripDuration: string;
  outDateISO: string;
  inFuture: boolean;
  flights: FlightTimeDataResult[];
  link: string;
}

export const transformTripData = (trip: TripWithData): TripResult => ({
  ...trip,
  user: excludeKeys(
    trip.user,
    'admin',
    'password',
    'id',
    'pushNotifications',
    'passwordResetToken',
    'passwordResetAt',
  ),
  tripDuration:
    trip.flights.length > 0
      ? getDurationDays({
          start: trip.flights[0].outTime,
          end: trip.flights[trip.flights.length - 1].inTime,
        })
      : '',
  outDateISO: formatInTimeZone(
    trip.outTime,
    trip.flights[0]?.departureAirport.timeZone ?? '',
    DATE_FORMAT_ISO,
  ),
  inFuture: getInFuture(trip.outTime),
  flights: trip.flights.map(transformFlightData),
  link: `/user/${trip.user.username}/trips/${trip.id}`,
});
