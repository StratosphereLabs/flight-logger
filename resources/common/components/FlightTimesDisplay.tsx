import classNames from 'classnames';
import { type HTMLProps } from 'react';

import { AppTheme, useThemeStore } from '../../stores';
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
}: FlightTimesDisplayProps): JSX.Element => {
  const { theme } = useThemeStore();
  return (
    <div
      className={classNames(
        'flex flex-wrap items-center gap-x-2 font-bold text-nowrap',
        className,
      )}
      {...props}
    >
      {data.actualValue !== data.value ? (
        <div
          className={classNames(
            data.actualLocal !== null
              ? 'text-xs line-through opacity-50'
              : 'text-sm',
          )}
        >
          {data.local}
          {data.daysAdded !== 0 ? (
            <sup>{`${data.daysAdded > 0 ? '+' : ''}${data.daysAdded}`}</sup>
          ) : null}
        </div>
      ) : null}
      {data.actualLocal !== null && data.actualDaysAdded !== null ? (
        <div
          className={classNames(
            'text-sm',
            TEXT_COLORS[data.delayStatus],
            [AppTheme.CYBERPUNK].includes(theme) && 'brightness-90',
          )}
        >
          {data.actualLocal}
          {data.actualDaysAdded !== 0 ? (
            <sup>
              {`${data.actualDaysAdded > 0 ? '+' : ''}${data.actualDaysAdded}`}
            </sup>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
