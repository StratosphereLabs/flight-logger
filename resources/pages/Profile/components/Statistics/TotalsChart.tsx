import { useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import { Loading, Stat, StatDesc, StatTitle, StatValue } from 'stratosphere-ui';

import {
  ClockIcon,
  ColoredFireIcon,
  DistanceIcon,
  MaterialPlaneIcon,
} from '../../../../common/components';
import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { getLongDurationString } from '../../../../common/utils';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import type { StatisticsChartProps } from './types';

export interface TotalsChartProps extends StatisticsChartProps {
  isStatsFullScreen: boolean;
}

export const TotalsChart = ({
  filtersFormControl,
  isStatsFullScreen,
  selectedAirportId,
}: TotalsChartProps): JSX.Element => {
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  const onError = useTRPCErrorHandler();
  const { data: userData } = useProfileUserQuery();
  const [status, range, year, month, fromDate, toDate, searchQuery] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate', 'searchQuery']
  >({
    control: filtersFormControl,
    name: [
      'status',
      'range',
      'year',
      'month',
      'fromDate',
      'toDate',
      'searchQuery',
    ],
  });
  const { data, isFetching } = trpc.statistics.getBasicStatistics.useQuery(
    {
      username,
      status,
      range,
      year,
      month,
      fromDate,
      toDate,
      selectedAirportId,
      searchQuery,
    },
    {
      enabled: userData !== undefined,
      keepPreviousData: true,
      onError,
    },
  );
  return (
    <div className="mb-2 flex w-full flex-col items-center gap-1 font-semibold">
      <div className="relative flex h-full w-full">
        {isFetching ? (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Loading shape="spinner" />
          </div>
        ) : null}
        {data !== undefined ? (
          <div
            className={classNames(
              'grid flex-1 grid-cols-2 transition-opacity',
              isStatsFullScreen ? 'lg:grid-cols-4' : '2xl:grid-cols-4',
              isFetching && 'opacity-50',
            )}
          >
            <Stat className="gap-1 p-2">
              <StatTitle>Flights</StatTitle>
              <StatValue className="flex items-center gap-2 text-3xl">
                <MaterialPlaneIcon className="text-primary/90 h-7 w-7 opacity-80" />
                <span className="text-primary/80">
                  {data.totals.totalFlights.toLocaleString()}
                </span>
              </StatValue>
              <StatDesc>
                {data.totals.onTimePercentage !== null
                  ? (
                      Math.round(10 * data.totals.onTimePercentage) / 10
                    ).toLocaleString()
                  : '-.-'}
                % on-time
              </StatDesc>
            </Stat>
            <Stat className="gap-1 p-2">
              <StatTitle>Streak</StatTitle>
              <StatValue
                className={classNames(
                  'flex items-center gap-2 text-3xl',
                  data.onTimeStreak < 2
                    ? 'text-primary/80'
                    : data.onTimeStreak < 5
                      ? 'text-warning/80'
                      : 'text-error/80',
                )}
              >
                <ColoredFireIcon className="h-7 w-7" />
                {data.onTimeStreak}
              </StatValue>
              <StatDesc>
                on-time flight{data.onTimeStreak !== 1 ? 's' : ''}
              </StatDesc>
            </Stat>
            <Stat className="col-span-2 gap-1 p-2 sm:col-span-1">
              <StatTitle>Distance Flown</StatTitle>
              <StatValue className="flex items-center gap-2 text-3xl">
                <DistanceIcon className="text-secondary/90 h-7 w-7 opacity-80" />
                <span className="text-secondary/80">
                  {Math.round(data.totals.totalDistanceMi).toLocaleString()} mi
                </span>
              </StatValue>
              <StatDesc>
                {Math.round(data.totals.totalDistanceKm).toLocaleString()} km
              </StatDesc>
            </Stat>
            <Stat className="col-span-2 gap-1 p-2 sm:col-span-1">
              <StatTitle>Time Flown</StatTitle>
              <StatValue className="flex items-center gap-2 text-3xl">
                <ClockIcon className="text-success/90 h-7 w-7 opacity-80" />
                <span className="text-success/80">
                  {getLongDurationString(data.totals.totalDuration)}
                </span>
              </StatValue>
              <StatDesc>
                {(
                  Math.round(100 * data.totals.totalDurationDays) / 100
                ).toLocaleString()}{' '}
                days
              </StatDesc>
            </Stat>
          </div>
        ) : null}
      </div>
    </div>
  );
};
