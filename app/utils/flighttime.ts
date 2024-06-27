import { type FlightRadarStatus, type airport } from '@prisma/client';
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
  DATE_FORMAT_ABBR,
  DATE_FORMAT_ISO,
  TIME_FORMAT_12H,
  TIME_FORMAT_24H,
} from '../constants';

export type FlightDelayStatus = 'canceled' | 'severe' | 'moderate' | 'none';

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
  flightRadarStatus?: FlightRadarStatus | null;
  departureTimeZone: string;
  arrivalTimeZone: string;
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
  durationStringAbbreviated: string;
  inFuture: boolean;
  outDateISO: string;
  outDateLocal: string;
  outTimeLocal: string;
  outDateLocalAbbreviated: string;
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
  flightRadarStatus,
  departureTimeZone,
  arrivalTimeZone,
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
    flightRadarStatus === 'CANCELED'
      ? 'canceled'
      : departureDelay !== null && departureDelay > 60
        ? 'severe'
        : departureDelay !== null && departureDelay > 15
          ? 'moderate'
          : 'none';
  const arrivalDelayStatus =
    flightRadarStatus === 'CANCELED'
      ? 'canceled'
      : arrivalDelay !== null && arrivalDelay > 60
        ? 'severe'
        : arrivalDelay !== null && arrivalDelay > 15
          ? 'moderate'
          : 'none';
  return {
    durationString: getDurationString(duration),
    durationStringAbbreviated: getDurationString(duration, true),
    inFuture: getInFuture(outTime),
    outDateISO: formatInTimeZone(outTime, departureTimeZone, DATE_FORMAT_ISO),
    outDateLocal: formatInTimeZone(outTime, departureTimeZone, DATE_FORMAT),
    outDateLocalAbbreviated: formatInTimeZone(
      outTime,
      departureTimeZone,
      DATE_FORMAT_ABBR,
    ),
    outTimeLocal: formatInTimeZone(outTime, departureTimeZone, TIME_FORMAT_12H),
    outTimeValue: formatInTimeZone(outTime, departureTimeZone, TIME_FORMAT_24H),
    outTimeActualLocal:
      outTimeActual !== undefined
        ? formatInTimeZone(outTimeActual, departureTimeZone, TIME_FORMAT_12H)
        : null,
    outTimeActualValue:
      outTimeActual !== undefined
        ? formatInTimeZone(outTimeActual, departureTimeZone, TIME_FORMAT_24H)
        : null,
    outTimeActualDaysAdded:
      outTimeActual !== undefined
        ? getDaysAdded({
            outTime,
            inTime: outTimeActual,
            outTimeZone: departureTimeZone,
            inTimeZone: departureTimeZone,
          })
        : null,
    inTimeLocal: formatInTimeZone(inTime, arrivalTimeZone, TIME_FORMAT_12H),
    inTimeValue: formatInTimeZone(inTime, arrivalTimeZone, TIME_FORMAT_24H),
    inTimeDaysAdded:
      getDaysAdded({
        outTime,
        inTime,
        outTimeZone: departureTimeZone,
        inTimeZone: arrivalTimeZone,
      }) ?? 0,
    inTimeActualLocal:
      inTimeActual !== undefined
        ? formatInTimeZone(inTimeActual, arrivalTimeZone, TIME_FORMAT_12H)
        : null,
    inTimeActualValue:
      inTimeActual !== undefined
        ? formatInTimeZone(inTimeActual, arrivalTimeZone, TIME_FORMAT_24H)
        : null,
    inTimeActualDaysAdded:
      inTimeActual !== undefined
        ? getDaysAdded({
            outTime,
            inTime: inTimeActual,
            outTimeZone: departureTimeZone,
            inTimeZone: arrivalTimeZone,
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
