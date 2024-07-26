import { type trip, type user } from '@prisma/client';
import { isFuture } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DATE_FORMAT_ISO } from '../constants';
import { getDurationDays } from './datetime';
import {
  type FlightData,
  type TransformFlightDataResult,
  flightIncludeObj,
  transformFlightData,
} from './flights';
import { type UserData } from './users';

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
  user: UserData;
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
  flights: TransformFlightDataResult[];
  link: string;
}

export const transformTripData = (trip: TripWithData): TripResult => ({
  ...trip,
  user: trip.user,
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
  inFuture: isFuture(trip.outTime),
  flights: trip.flights.map(transformFlightData),
  link: `/user/${trip.user.username}/trips/${trip.id}`,
});
