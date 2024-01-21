import { type airport } from '@prisma/client';
import { add, isBefore } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import {
  getDaysAdded,
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

export type FlightDelayStatus = 'severe' | 'moderate' | 'none';

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
  outTimeActualDaysAdded: number | null;
  inTimeLocal: string;
  inTimeValue: string;
  inTimeDaysAdded: number;
  inTimeActualLocal: string | null;
  inTimeActualValue: string | null;
  inTimeActualDaysAdded: number | null;
  departureDelay: string | null;
  departureDelayValue: number | null;
  departureDelayStatus: FlightDelayStatus;
  arrivalDelay: string | null;
  arrivalDelayValue: number | null;
  arrivalDelayStatus: FlightDelayStatus;
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
    outTimeActual !== undefined && isBefore(outTime, outTimeActual)
      ? getDurationMinutes({
          start: outTime,
          end: outTimeActual,
        })
      : null;
  const arrivalDelay =
    inTimeActual !== undefined && isBefore(inTime, inTimeActual)
      ? getDurationMinutes({
          start: inTime,
          end: inTimeActual,
        })
      : null;
  const departureDelayStatus =
    departureDelay !== null && departureDelay > 60
      ? 'severe'
      : departureDelay !== null && departureDelay > 15
        ? 'moderate'
        : 'none';
  const arrivalDelayStatus =
    arrivalDelay !== null && arrivalDelay > 60
      ? 'severe'
      : arrivalDelay !== null && arrivalDelay > 15
        ? 'moderate'
        : 'none';
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
    outTimeActualDaysAdded:
      outTimeActual !== undefined
        ? getDaysAdded({
            outTime,
            inTime: outTimeActual,
            outTimeZone: departureAirport.timeZone,
            inTimeZone: departureAirport.timeZone,
          })
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
    inTimeDaysAdded:
      getDaysAdded({
        outTime,
        inTime,
        outTimeZone: departureAirport.timeZone,
        inTimeZone: arrivalAirport.timeZone,
      }) ?? 0,
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
    inTimeActualDaysAdded:
      inTimeActual !== undefined
        ? getDaysAdded({
            outTime,
            inTime: inTimeActual,
            outTimeZone: departureAirport.timeZone,
            inTimeZone: arrivalAirport.timeZone,
          })
        : null,
    departureDelay:
      departureDelay !== null ? getDurationString(departureDelay) : null,
    departureDelayValue: departureDelay,
    departureDelayStatus,
    arrivalDelay:
      arrivalDelay !== null ? getDurationString(arrivalDelay) : null,
    arrivalDelayValue: arrivalDelay,
    arrivalDelayStatus,
  };
};
