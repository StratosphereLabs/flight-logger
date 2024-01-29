import {
  add,
  formatDuration,
  type Interval,
  intervalToDuration,
  isBefore,
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
}: DaysAddedOptions): number | null => {
  const outDate = formatInTimeZone(outTime, outTimeZone, DATE_FORMAT_ISO);
  const inDate = formatInTimeZone(inTime, inTimeZone, DATE_FORMAT_ISO);
  const { days } = intervalToDuration({
    start: new Date(outDate),
    end: new Date(inDate),
  });
  return days ?? null;
};

export const getDaysToAdd = ({ outTime, inTime }: DaysToAddOptions): number => {
  const inTimePlusOneDay = add(inTime, {
    days: 1,
  });
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
    return `${
      hours !== undefined ? `${hours < 10 ? '0' : ''}${hours}` : '00'
    }:${minutes !== undefined ? `${minutes < 10 ? '0' : ''}${minutes}` : '00'}`;
  }
  return `${hours !== undefined && hours > 0 ? `${hours}h ` : ''}${
    minutes ?? 0
  }m`;
};

export const getInFuture = (date: string | number | Date): boolean =>
  !isBefore(new Date(date), new Date());
