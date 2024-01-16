import { type airport } from '@prisma/client';
import { add } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import {
  getDaysToAdd,
  getDurationMinutes,
  getDurationString,
  getInFuture,
} from './datetime';
import {
  DATE_FORMAT,
  DATE_FORMAT_ISO,
  TIME_FORMAT_12H,
  TIME_FORMAT_24H,
} from '../constants';

export interface FlightTimesInput {
  departureAirport: airport;
  arrivalAirport: airport;
  outDateISO: string;
  outTimeValue: string;
  offTimeActualValue?: string;
  inTimeValue: string;
  onTimeActualValue?: string;
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
  offTimeActual?: Date;
  inTime: Date;
  onTimeActual?: Date;
}

export interface FlightTimestampsResult {
  durationString: string;
  inFuture: boolean;
  outDateISO: string;
  outDateLocal: string;
  outTimeLocal: string;
  outTimeValue: string;
  inTimeLocal: string;
  inTimeValue: string;
}

export const getFlightTimes = ({
  departureAirport,
  arrivalAirport,
  outDateISO,
  outTimeValue,
  offTimeActualValue,
  inTimeValue,
  onTimeActualValue,
}: FlightTimesInput): FlightTimesResult => {
  const outTimeUtc = zonedTimeToUtc(
    `${outDateISO} ${outTimeValue}`,
    departureAirport.timeZone,
  );
  const offTimeActualUtc =
    offTimeActualValue !== undefined
      ? zonedTimeToUtc(
          `${outDateISO} ${offTimeActualValue}`,
          departureAirport.timeZone,
        )
      : undefined;
  const inTimeUtc = zonedTimeToUtc(
    `${outDateISO} ${inTimeValue}`,
    arrivalAirport.timeZone,
  );
  const onTimeActualUtc =
    onTimeActualValue !== undefined
      ? zonedTimeToUtc(
          `${outDateISO} ${onTimeActualValue}`,
          arrivalAirport.timeZone,
        )
      : undefined;
  const daysAdded = getDaysToAdd({ outTime: outTimeUtc, inTime: inTimeUtc });
  const daysAddedActual =
    onTimeActualUtc !== undefined
      ? getDaysToAdd({
          outTime: outTimeUtc,
          inTime: onTimeActualUtc,
        })
      : undefined;
  const correctedInTime = add(inTimeUtc, {
    days: daysAdded,
  });
  const correctedOnTimeActual =
    onTimeActualUtc !== undefined
      ? add(onTimeActualUtc, {
          days: daysAddedActual,
        })
      : undefined;
  const duration = getDurationMinutes({
    start: outTimeUtc,
    end: correctedInTime,
  });
  return {
    duration,
    outTime: outTimeUtc,
    offTimeActual: offTimeActualUtc,
    inTime: correctedInTime,
    onTimeActual: correctedOnTimeActual,
  };
};

export const getFlightTimestamps = ({
  departureAirport,
  arrivalAirport,
  duration,
  outTime,
  inTime,
}: FlightTimestampsInput): FlightTimestampsResult => ({
  durationString: getDurationString(duration),
  inFuture: getInFuture(outTime),
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
    TIME_FORMAT_12H,
  ),
  outTimeValue: formatInTimeZone(
    outTime,
    departureAirport.timeZone,
    TIME_FORMAT_24H,
  ),
  inTimeLocal: formatInTimeZone(
    inTime,
    arrivalAirport.timeZone,
    TIME_FORMAT_12H,
  ),
  inTimeValue: formatInTimeZone(
    inTime,
    arrivalAirport.timeZone,
    TIME_FORMAT_24H,
  ),
});
