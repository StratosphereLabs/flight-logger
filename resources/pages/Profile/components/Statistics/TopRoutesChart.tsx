import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  FormToggleSwitch,
  Loading,
  Stat,
  StatTitle,
  StatValue,
  Stats,
  Tooltip,
} from 'stratosphere-ui';

import { BAR_CHART_THEME } from '../../../../common/constants';
import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { type StatisticsFiltersData } from './StatisticsCard';
import type { StatisticsChartProps } from './types';

export const TopRoutesChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const cityPairs = useWatch<StatisticsFiltersData, 'routesCityPairs'>({
    name: 'routesCityPairs',
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
  const { data, isFetching } = trpc.statistics.getAllStatistics.useQuery(
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
  const title = cityPairs ? 'City Pairs' : 'Routes';
  const chartData = useMemo(
    () =>
      data !== undefined
        ? (cityPairs
            ? data.topRoutes.cityPairChartData
            : data.topRoutes.routeChartData
          )
            .sort((a, b) => b.flights - a.flights)
            .slice(0, 5)
            .reverse()
        : [],
    [cityPairs, data],
  );
  return (
    <div className="flex h-[250px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex min-h-8 w-full items-center justify-between">
        <div className="text-base">{title}</div>
        <FormToggleSwitch
          className="my-[-3px]"
          name="routesCityPairs"
          size="xs"
        >
          City Pairs
        </FormToggleSwitch>
      </div>
      <Stats className="h-24 w-full">
        <Stat className="flex items-center py-0">
          <StatValue className="text-warning/80">
            {cityPairs
              ? data?.topRoutes.cityPairCount
              : data?.topRoutes.routeCount}
          </StatValue>
          <StatTitle>Total {cityPairs ? 'City Pairs' : 'Routes'}</StatTitle>
        </Stat>
      </Stats>
      <div className="relative h-full w-full">
        {isFetching ? (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Loading shape="spinner" />
          </div>
        ) : null}
        {data !== undefined ? (
          <div
            className={classNames(
              'h-full w-full transition-opacity',
              isFetching && 'opacity-50',
            )}
          >
            <ResponsiveBar
              theme={BAR_CHART_THEME}
              layout="horizontal"
              data={chartData}
              keys={['flights']}
              indexBy="route"
              label={d => d.data.flights.toLocaleString()}
              enableGridY={false}
              axisBottom={{
                tickSize: 0,
              }}
              axisLeft={{
                tickSize: 0,
              }}
              margin={{
                left: 65,
              }}
              colors={['oklch(from var(--color-warning) l c h / 0.75)']}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.route}: ${tooltipData.data.flights.toLocaleString()} ${tooltipData.data.flights > 1 ? 'flights' : 'flight'}`}
                />
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
