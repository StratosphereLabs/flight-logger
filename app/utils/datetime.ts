import { add, Interval, intervalToDuration, isBefore } from 'date-fns';

export interface DaysToAddOptions {
  outTime: Date;
  inTime: Date;
}

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

export const getDurationString = (duration: number): string => {
  const { hours, minutes } = intervalToDuration({
    start: 0,
    end: duration * 60 * 1000,
  });
  return duration > 0 ? `${hours ?? 0}h ${minutes ?? 0}m` : '';
};

export const getInFuture = (date: string | number | Date): boolean =>
  !isBefore(new Date(date), new Date());
