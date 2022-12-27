import { airport } from '@prisma/client';
import { add, intervalToDuration, isBefore } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

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
  const correctedInTime = isBefore(inTimeUtc, outTimeUtc)
    ? add(inTimeUtc, {
        days: 1,
      })
    : inTimeUtc;
  const duration = intervalToDuration({
    start: outTimeUtc,
    end: correctedInTime,
  });
  return {
    duration: 60 * (duration.hours ?? 0) + (duration.minutes ?? 0),
    outTime: outTimeUtc,
    offTime: null,
    onTime: null,
    inTime: correctedInTime,
  };
};

export const getUTCTime = (
  date: string,
  time: string,
  timeZone: string,
): string => zonedTimeToUtc(`${date} ${time}`, timeZone).toISOString();
