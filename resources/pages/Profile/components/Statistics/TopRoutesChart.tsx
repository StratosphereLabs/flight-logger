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

import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { type StatisticsFiltersData } from './StatisticsCard';
import { BAR_CHART_THEME } from './constants';
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
  const { data, isFetching } = trpc.statistics.getTopRoutes.useQuery(
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
        ? (cityPairs ? data.cityPairChartData : data.routeChartData)
            .sort((a, b) => b.flights - a.flights)
            .slice(0, 5)
            .reverse()
        : [],
    [cityPairs, data],
  );
  return (
    <div className="flex h-[250px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex w-full items-center justify-between">
        <div className="text-lg">{title}</div>
        <FormToggleSwitch
          className="my-[-3px]"
          labelText="City Pairs"
          name="routesCityPairs"
          size="xs"
        />
      </div>
      <Stats className="h-24 w-full">
        <Stat className="flex items-center py-0">
          <StatValue className="text-warning/80">
            {cityPairs ? data?.cityPairCount : data?.routeCount}
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
              colors={['var(--fallback-wa,oklch(var(--wa)/0.75))']}
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
