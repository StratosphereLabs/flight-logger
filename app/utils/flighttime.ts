import { type Airport } from '@prisma/client';
import { add, isBefore, isFuture, sub } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

import {
  DATE_FORMAT,
  DATE_FORMAT_ABBR,
  DATE_FORMAT_ISO,
  TIME_FORMAT_12H,
  TIME_FORMAT_24H,
} from '../constants';
import {
  getDaysAdded,
  getDaysToAdd,
  getDurationMinutes,
  getDurationString,
} from './datetime';

export type FlightDelayStatus = 'canceled' | 'severe' | 'moderate' | 'none';

export interface FlightTimesInput {
  departureAirport: Airport;
  arrivalAirport: Airport;
  outDateISO: string;
  outTimeValue: string;
  offTimeActualValue?: string;
  inTimeValue: string;
  onTimeActualValue?: string;
}

export interface FlightTimestampsInput {
  departureTimeZone: string;
  arrivalTimeZone: string;
  duration: number;
  outTime: number | Date;
  outTimeActual?: number | Date;
  offTime?: number | Date;
  offTimeActual?: number | Date;
  onTime?: number | Date;
  onTimeActual?: number | Date;
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
  offTimeLocal: string;
  offTimeValue: string;
  offTimeDaysAdded: number;
  offTimeActualLocal: string | null;
  offTimeActualValue: string | null;
  offTimeActualDaysAdded: number | null;
  onTimeLocal: string;
  onTimeValue: string;
  onTimeDaysAdded: number;
  onTimeActualLocal: string | null;
  onTimeActualValue: string | null;
  onTimeActualDaysAdded: number | null;
  inTimeLocal: string;
  inTimeValue: string;
  inTimeDaysAdded: number;
  inTimeActualLocal: string | null;
  inTimeActualValue: string | null;
  inTimeActualDaysAdded: number | null;
  departureDelay: string | null;
  departureDelayValue: number | null;
  departureDelayStatus: FlightDelayStatus;
  takeoffDelayStatus: FlightDelayStatus;
  landingDelayStatus: FlightDelayStatus;
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
  const outTimeUtc = fromZonedTime(
    `${outDateISO} ${outTimeValue}`,
    departureAirport.timeZone,
  );
  const offTimeActualUtc =
    offTimeActualValue !== undefined
      ? fromZonedTime(
          `${outDateISO} ${offTimeActualValue}`,
          departureAirport.timeZone,
        )
      : undefined;
  const inTimeUtc = fromZonedTime(
    `${outDateISO} ${inTimeValue}`,
    arrivalAirport.timeZone,
  );
  const onTimeActualUtc =
    onTimeActualValue !== undefined
      ? fromZonedTime(
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

export const getFlightDelayStatus = (
  delayValue: number | null,
): FlightDelayStatus =>
  delayValue !== null && delayValue >= 60
    ? 'severe'
    : delayValue !== null && delayValue >= 15
      ? 'moderate'
      : 'none';

export const getFlightTimestamps = ({
  departureTimeZone,
  arrivalTimeZone,
  duration,
  outTime,
  outTimeActual,
  offTime,
  offTimeActual,
  onTime,
  onTimeActual,
  inTime,
  inTimeActual,
}: FlightTimestampsInput): FlightTimestampsResult => {
  const currentOffTime = offTime ?? add(outTime, { minutes: 10 });
  const currentOffTimeActual =
    offTimeActual ?? add(outTimeActual ?? outTime, { minutes: 10 });
  const currentOnTime = onTime ?? sub(inTime, { minutes: 10 });
  const currentOnTimeActual =
    onTimeActual ?? sub(inTimeActual ?? inTime, { minutes: 10 });
  const departureDelay =
    outTimeActual !== undefined && isBefore(outTime, outTimeActual)
      ? getDurationMinutes({
          start: outTime,
          end: outTimeActual,
        })
      : null;
  const takeoffDelay = isBefore(currentOffTime, currentOffTimeActual)
    ? getDurationMinutes({
        start: currentOffTime,
        end: currentOffTimeActual,
      })
    : null;
  const landingDelay = isBefore(currentOnTime, currentOnTimeActual)
    ? getDurationMinutes({
        start: currentOnTime,
        end: currentOnTimeActual,
      })
    : null;
  const arrivalDelay =
    inTimeActual !== undefined && isBefore(inTime, inTimeActual)
      ? getDurationMinutes({
          start: inTime,
          end: inTimeActual,
        })
      : null;
  const departureDelayStatus = getFlightDelayStatus(departureDelay);
  const takeoffDelayStatus = getFlightDelayStatus(takeoffDelay);
  const landingDelayStatus = getFlightDelayStatus(landingDelay);
  const arrivalDelayStatus = getFlightDelayStatus(arrivalDelay);
  return {
    durationString: getDurationString(duration),
    durationStringAbbreviated: getDurationString(duration, true),
    inFuture: isFuture(outTime),
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
    offTimeLocal: formatInTimeZone(
      currentOffTime,
      departureTimeZone,
      TIME_FORMAT_12H,
    ),
    offTimeValue: formatInTimeZone(
      currentOffTime,
      departureTimeZone,
      TIME_FORMAT_24H,
    ),
    offTimeDaysAdded: getDaysAdded({
      outTime,
      inTime: currentOffTime,
      outTimeZone: departureTimeZone,
      inTimeZone: departureTimeZone,
    }),
    offTimeActualLocal: formatInTimeZone(
      currentOffTimeActual,
      departureTimeZone,
      TIME_FORMAT_12H,
    ),
    offTimeActualValue: formatInTimeZone(
      currentOffTimeActual,
      departureTimeZone,
      TIME_FORMAT_24H,
    ),
    offTimeActualDaysAdded: getDaysAdded({
      outTime,
      inTime: currentOffTimeActual,
      outTimeZone: departureTimeZone,
      inTimeZone: departureTimeZone,
    }),
    onTimeLocal: formatInTimeZone(
      currentOnTime,
      arrivalTimeZone,
      TIME_FORMAT_12H,
    ),
    onTimeValue: formatInTimeZone(
      currentOnTime,
      arrivalTimeZone,
      TIME_FORMAT_24H,
    ),
    onTimeDaysAdded: getDaysAdded({
      outTime,
      inTime: currentOnTime,
      outTimeZone: departureTimeZone,
      inTimeZone: arrivalTimeZone,
    }),
    onTimeActualLocal: formatInTimeZone(
      currentOnTimeActual,
      arrivalTimeZone,
      TIME_FORMAT_12H,
    ),
    onTimeActualValue: formatInTimeZone(
      currentOnTimeActual,
      arrivalTimeZone,
      TIME_FORMAT_24H,
    ),
    onTimeActualDaysAdded: getDaysAdded({
      outTime,
      inTime: currentOnTimeActual,
      outTimeZone: departureTimeZone,
      inTimeZone: arrivalTimeZone,
    }),
    inTimeLocal: formatInTimeZone(inTime, arrivalTimeZone, TIME_FORMAT_12H),
    inTimeValue: formatInTimeZone(inTime, arrivalTimeZone, TIME_FORMAT_24H),
    inTimeDaysAdded: getDaysAdded({
      outTime,
      inTime,
      outTimeZone: departureTimeZone,
      inTimeZone: arrivalTimeZone,
    }),
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
    takeoffDelayStatus,
    landingDelayStatus,
    arrivalDelay:
      arrivalDelay !== null ? getDurationString(arrivalDelay) : null,
    arrivalDelayValue: arrivalDelay,
    arrivalDelayStatus,
  };
};
