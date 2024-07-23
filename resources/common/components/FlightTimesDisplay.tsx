import classNames from 'classnames';
import { type HTMLProps } from 'react';
import { TEXT_COLORS } from '../constants';
import type { FlightDelayStatus } from '../types';

export interface FlightTimesDisplayProps
  extends Omit<HTMLProps<HTMLDivElement>, 'data'> {
  className?: string;
  data: {
    delayStatus: FlightDelayStatus;
    actualValue: string | null;
    value: string;
    actualLocal: string | null;
    local: string;
    actualDaysAdded: number | null;
    daysAdded: number;
  };
}

export const FlightTimesDisplay = ({
  className,
  data,
  ...props
}: FlightTimesDisplayProps): JSX.Element => (
  <div
    className={classNames(
      'flex flex-wrap items-center gap-x-2 font-bold',
      className,
    )}
    {...props}
  >
    {data.actualValue !== data.value ? (
      <div
        className={classNames(
          data.actualLocal !== null
            ? 'text-xs line-through opacity-50'
            : 'text-xs lg:text-sm',
        )}
      >
        {data.local}
        {data.daysAdded > 0 ? <sup>+{data.daysAdded}</sup> : null}
      </div>
    ) : null}
    {data.actualLocal !== null && data.actualDaysAdded !== null ? (
      <div
        className={classNames(
          'text-xs lg:text-sm',
          TEXT_COLORS[data.delayStatus],
        )}
      >
        {data.actualLocal}
        {data.actualDaysAdded > 0 ? <sup>+{data.actualDaysAdded}</sup> : null}
      </div>
    ) : null}
  </div>
);
