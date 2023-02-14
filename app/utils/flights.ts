import { airport } from '@prisma/client';
import { add, isBefore } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import {
  getDaysToAdd,
  getDurationMinutes,
  getDurationString,
} from './datetime';
import { DATE_FORMAT, DATE_FORMAT_ISO, TIME_FORMAT } from '../constants';

export interface FlightTimesInput {
  departureAirport: airport;
  arrivalAirport: airport;
  outDate: string;
  outTime: string;
  offTime: string | null;
  onTime: string | null;
  inTime: string;
}

export interface FlightTimestampsInput {
  departureAirport: airport;
  arrivalAirport: airport;
  duration: number;
  outTime: string | number | Date;
  inTime: string | number | Date;
}

export interface FlightTimesResult {
  duration: number;
  outTime: Date;
  offTime: Date | null;
  onTime: Date | null;
  inTime: Date;
  daysAdded: number;
}

export interface FlightTimestampsResult {
  duration: string;
  inFuture: boolean;
  outDateISO: string;
  outDateLocal: string;
  outTimeLocal: string;
  inTimeLocal: string;
}

export const getFlightTimes = ({
  departureAirport,
  arrivalAirport,
  outDate,
  outTime,
  offTime,
  onTime,
  inTime,
}: FlightTimesInput): FlightTimesResult => {
  const outTimeUtc = zonedTimeToUtc(
    `${outDate} ${outTime}`,
    departureAirport.timeZone,
  );
  const inTimeUtc = zonedTimeToUtc(
    `${outDate} ${inTime}`,
    arrivalAirport.timeZone,
  );
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

export const getFlightTimestamps = ({
  departureAirport,
  arrivalAirport,
  duration,
  outTime,
  inTime,
}: FlightTimestampsInput): FlightTimestampsResult => ({
  duration: getDurationString(duration),
  inFuture: !isBefore(new Date(outTime), new Date()),
  outDateISO: formatInTimeZone(
    outTime,
    departureAirport.timeZone,
    DATE_FORMAT_ISO,
  ),
  outDateLocal: formatInTimeZone(
    outTime,
    departureAirport.timeZone,
    DATE_FORMAT,
  ),
  outTimeLocal: formatInTimeZone(
    outTime,
    departureAirport.timeZone,
    TIME_FORMAT,
  ),
  inTimeLocal: formatInTimeZone(inTime, arrivalAirport.timeZone, TIME_FORMAT),
});
