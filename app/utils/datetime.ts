import {
  type Interval,
  add,
  formatDuration,
  intervalToDuration,
  isAfter,
  isBefore,
  setMilliseconds,
  setMinutes,
  setSeconds,
  sub,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { DATE_FORMAT_ISO } from '../constants';

export interface DaysToAddOptions {
  outTime: Date | number;
  inTime: Date | number;
}

export interface DaysAddedOptions extends DaysToAddOptions {
  outTimeZone: string;
  inTimeZone: string;
}

export const getDaysAdded = ({
  outTime,
  inTime,
  outTimeZone,
  inTimeZone,
}: DaysAddedOptions): number => {
  const outDate = formatInTimeZone(outTime, outTimeZone, DATE_FORMAT_ISO);
  const inDate = formatInTimeZone(inTime, inTimeZone, DATE_FORMAT_ISO);
  const { days } = intervalToDuration({
    start: new Date(outDate),
    end: new Date(inDate),
  });
  if (days === undefined) return 0;
  return outDate > inDate ? -1 * days : days;
};

export const getDaysToAdd = ({ outTime, inTime }: DaysToAddOptions): number => {
  const inTimePlusOneDay = add(inTime, {
    days: 1,
  });
  const inTimeMinusOneDay = sub(inTime, {
    days: 1,
  });
  if (isAfter(inTimeMinusOneDay, outTime)) return -1;
  if (isBefore(inTimePlusOneDay, outTime)) return 2;
  if (isBefore(inTime, outTime)) return 1;
  return 0;
};

export const getDurationMinutes = (interval: Interval): number => {
  const layoverDuration = intervalToDuration(interval);
  return (
    12 * 30 * 24 * 60 * (layoverDuration.years ?? 0) +
    30 * 24 * 60 * (layoverDuration.months ?? 0) +
    24 * 60 * (layoverDuration.days ?? 0) +
    60 * (layoverDuration.hours ?? 0) +
    (layoverDuration.minutes ?? 0)
  );
};

export const getDurationDays = (interval: Interval): string => {
  const duration = intervalToDuration(interval);
  return formatDuration(duration, {
    format: ['days', 'hours'],
    zero: false,
    delimiter: ',  ',
  });
};

export const getDurationString = (
  duration: number,
  abbreviated?: boolean,
): string => {
  const { hours, minutes } = intervalToDuration({
    start: 0,
    end: duration * 60 * 1000,
  });
  if (abbreviated === true) {
    return `${hours ?? 0}:${
      minutes !== undefined ? `${minutes < 10 ? '0' : ''}${minutes}` : '00'
    }`;
  }
  return `${hours !== undefined && hours > 0 ? `${hours}h ` : ''}${
    minutes !== undefined ? `${minutes < 10 ? '0' : ''}${minutes}` : '00'
  }m`;
};

export const getRainviewerTimestamp = (date: Date): number | null => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 10) * 10;
  const roundedDate = setMilliseconds(
    setSeconds(setMinutes(date, roundedMinutes), 0),
    0,
  );
  return isAfter(roundedDate, sub(new Date(), { hours: 60 }))
    ? Math.floor(roundedDate.getTime() / 1000)
    : null;
};
