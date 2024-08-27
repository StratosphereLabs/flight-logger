import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Loading,
  Stat,
  StatDesc,
  StatFigure,
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
import { ClockIcon, DistanceIcon } from '../../../../common/components';
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
          <Stats
            className={classNames(
              'stats-vertical flex-1 transition-opacity sm:stats-horizontal',
              isFetching && 'opacity-50',
            )}
          >
            <Stat className="py-2">
              <StatFigure>
                <DistanceIcon className="h-10 w-10 opacity-80" />
              </StatFigure>
              <StatTitle>Distance Flown</StatTitle>
              <StatValue className="text-primary/80">
                {data.totalDistanceMi.toLocaleString()} mi
              </StatValue>
              <StatDesc>{data.totalDistanceKm.toLocaleString()} km</StatDesc>
            </Stat>
            <Stat className="py-2">
              <StatFigure>
                <ClockIcon className="h-10 w-10 opacity-80" />
              </StatFigure>
              <StatTitle>Time Flown</StatTitle>
              <StatValue className="text-secondary/80">
                {data.totalDuration}
              </StatValue>
              <StatDesc>{data.totalDurationDays} days</StatDesc>
            </Stat>
          </Stats>
        ) : null}
      </div>
    </div>
  );
};
