import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Loading,
  Select,
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

export const TopRegionsChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const mode = useWatch<StatisticsFiltersData, 'regionsMode'>({
    name: 'regionsMode',
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
  const chartData = useMemo(
    () =>
      data !== undefined
        ? data.topRegions.chartData
            .sort((a, b) => b[mode] - a[mode])
            .slice(0, 5)
            .reverse()
        : [],
    [data, mode],
  );
  return (
    <div className="flex h-[250px] max-w-[500px] min-w-[250px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">Regions</div>
        <Select
          anchor="bottom end"
          buttonProps={{ color: 'ghost', size: 'sm' }}
          formValueMode="id"
          getItemText={({ text }) => text}
          options={[
            {
              id: 'all',
              text: 'All',
            },
            {
              id: 'departure',
              text: 'Departure',
            },
            {
              id: 'arrival',
              text: 'Arrival',
            },
          ]}
          menuClassName="w-[185px] bg-base-200 z-50"
          name="regionsMode"
        />
      </div>
      <Stats className="h-24 w-full">
        <Stat className="flex items-center py-0">
          <StatValue className="text-info/80">
            {data?.topRegions.count}
          </StatValue>
          <StatTitle>Total Regions</StatTitle>
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
              keys={[mode]}
              indexBy="id"
              label={d => d.data[mode].toLocaleString()}
              enableGridY={false}
              axisBottom={{
                tickSize: 0,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 20,
              }}
              margin={{
                left: 65,
              }}
              colors={['oklch(from var(--color-info) l c h / 0.75)']}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.region}: ${tooltipData.data[
                    mode
                  ].toLocaleString()} ${tooltipData.data[mode] > 1 ? 'flights' : 'flight'}`}
                />
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
