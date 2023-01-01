import { airport } from '@prisma/client';
import { add } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { getDaysToAdd, getDurationMinutes } from './datetime';

export interface FlightTimestampsInput {
  departureAirport: airport;
  arrivalAirport: airport;
  outDate: string;
  outTime: string;
  offTime: string | null;
  onTime: string | null;
  inTime: string;
}

export interface FlightTimestampsResult {
  duration: number;
  outTime: Date;
  offTime: Date | null;
  onTime: Date | null;
  inTime: Date;
  daysAdded: number;
}

export const getFlightTimestamps = ({
  departureAirport,
  arrivalAirport,
  outDate,
  outTime,
  offTime,
  onTime,
  inTime,
}: FlightTimestampsInput): FlightTimestampsResult => {
  const departureTimeZone = departureAirport.timeZone;
  const arrivalTimeZone = arrivalAirport.timeZone;
  const outTimeUtc = zonedTimeToUtc(`${outDate} ${outTime}`, departureTimeZone);
  const inTimeUtc = zonedTimeToUtc(`${outDate} ${inTime}`, arrivalTimeZone);
  const daysAdded = getDaysToAdd({ outTime: outTimeUtc, inTime: inTimeUtc });
  const correctedInTime = add(inTimeUtc, {
    days: daysAdded,
  });
  const duration = getDurationMinutes({
    start: outTimeUtc,
    end: correctedInTime,
  });
  return {
    duration,
    outTime: outTimeUtc,
    offTime: null,
    onTime: null,
    inTime: correctedInTime,
    daysAdded,
  };
};
