import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Loading,
  Stat,
  StatDesc,
  Stats,
  StatTitle,
  StatValue,
} from 'stratosphere-ui';
import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import type { StatisticsChartProps } from './types';
import {
  ClockIcon,
  ColoredFireIcon,
  DistanceIcon,
  MaterialPlaneIcon,
} from '../../../../common/components';
import classNames from 'classnames';

export const TotalsChart = ({
  filtersFormControl,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data: userData } = useProfileUserQuery();
  const [status, range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['status', 'range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { data, isFetching } = trpc.statistics.getTotals.useQuery(
    {
      username,
      limit: 5,
      status,
      range,
      year,
      month,
      fromDate,
      toDate,
    },
    {
      enabled: userData !== undefined,
      keepPreviousData: true,
      onError,
    },
  );
  return (
    <div className="flex w-full flex-col items-center gap-1 font-semibold">
      <div className="relative flex h-full w-full">
        {isFetching ? (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Loading shape="spinner" />
          </div>
        ) : null}
        {data !== undefined ? (
          <div
            className={classNames(
              'flex flex-1 flex-col flex-wrap transition-opacity 2xl:flex-row',
              isFetching && 'opacity-50',
            )}
          >
            <Stats className="stats-horizontal lg:flex-1">
              <Stat className="p-2">
                <StatTitle>Flights</StatTitle>
                <StatValue className="flex items-center gap-2">
                  <MaterialPlaneIcon className="h-8 h-8 opacity-80" />
                  <span className="text-primary/80">{data.totalFlights}</span>
                </StatValue>
                <StatDesc>{data.onTimePercentage}% on-time</StatDesc>
              </Stat>
              <Stat className="p-2">
                <StatTitle>Streak</StatTitle>
                <StatValue
                  className={classNames(
                    'flex items-center gap-2',
                    data.onTimeStreak < 2
                      ? 'text-primary/80'
                      : data.onTimeStreak < 5
                        ? 'text-warning/80'
                        : 'text-error/80',
                  )}
                >
                  <ColoredFireIcon className="h-8 w-8" />
                  {data.onTimeStreak}
                </StatValue>
                <StatDesc>
                  on-time flight{data.onTimeStreak !== 1 ? 's' : ''}
                </StatDesc>
              </Stat>
            </Stats>
            <Stats className="stats-vertical flex-1 lg:stats-horizontal">
              <Stat className="p-2">
                <StatTitle>Distance Flown</StatTitle>
                <StatValue className="flex items-center gap-2">
                  <DistanceIcon className="h-8 w-8 opacity-80" />
                  <span className="text-secondary/80">
                    {data.totalDistanceMi.toLocaleString()} mi
                  </span>
                </StatValue>
                <StatDesc>{data.totalDistanceKm.toLocaleString()} km</StatDesc>
              </Stat>
              <Stat className="p-2">
                <StatTitle>Time Flown</StatTitle>
                <StatValue className="flex items-center gap-2">
                  <ClockIcon className="h-8 w-8 opacity-80" />
                  <span className="text-success/80">{data.totalDuration}</span>
                </StatValue>
                <StatDesc>{data.totalDurationDays} days</StatDesc>
              </Stat>
            </Stats>
          </div>
        ) : null}
      </div>
    </div>
  );
};