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
  outTime: number | Date;
  outTimeActual?: number | Date;
  inTime: number | Date;
  inTimeActual?: number | Date;
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
  outTimeActualLocal: string | null;
  outTimeActualValue: string | null;
  inTimeLocal: string;
  inTimeValue: string;
  inTimeActualLocal: string | null;
  inTimeActualValue: string | null;
  departureDelay: string | null;
  departureDelayValue: number | null;
  arrivalDelay: string | null;
  arrivalDelayValue: number | null;
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
  outTimeActual,
  inTime,
  inTimeActual,
}: FlightTimestampsInput): FlightTimestampsResult => {
  const departureDelay =
    outTimeActual !== undefined
      ? getDurationMinutes({
          start: outTime,
          end: outTimeActual,
        })
      : null;
  const arrivalDelay =
    inTimeActual !== undefined
      ? getDurationMinutes({
          start: inTime,
          end: inTimeActual,
        })
      : null;
  return {
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
    outTimeActualLocal:
      outTimeActual !== undefined
        ? formatInTimeZone(
            outTimeActual,
            departureAirport.timeZone,
            TIME_FORMAT_12H,
          )
        : null,
    outTimeActualValue:
      outTimeActual !== undefined
        ? formatInTimeZone(
            outTimeActual,
            departureAirport.timeZone,
            TIME_FORMAT_24H,
          )
        : null,
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
    inTimeActualLocal:
      inTimeActual !== undefined
        ? formatInTimeZone(
            inTimeActual,
            arrivalAirport.timeZone,
            TIME_FORMAT_12H,
          )
        : null,
    inTimeActualValue:
      inTimeActual !== undefined
        ? formatInTimeZone(
            inTimeActual,
            arrivalAirport.timeZone,
            TIME_FORMAT_24H,
          )
        : null,
    departureDelay:
      departureDelay !== null ? getDurationString(departureDelay) : null,
    departureDelayValue: departureDelay,
    arrivalDelay:
      arrivalDelay !== null ? getDurationString(arrivalDelay) : null,
    arrivalDelayValue: arrivalDelay,
  };
};
