import type { AxisTickProps } from '@nivo/axes';
import { ResponsiveBar } from '@nivo/bar';
import { useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import {
  Loading,
  Select,
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
import { AppTheme, useThemeStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { type StatisticsFiltersData } from './StatisticsCard';
import type { StatisticsChartProps } from './types';

export const TopCountriesChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  const { theme } = useThemeStore();
  const mode = useWatch<StatisticsFiltersData, 'countriesMode'>({
    name: 'countriesMode',
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
  const chartData = useMemo(
    () =>
      data !== undefined
        ? data.topCountries.chartData
            .sort((a, b) => b[mode] - a[mode])
            .slice(0, 5)
            .reverse()
        : [],
    [data, mode],
  );
  return (
    <div className="flex h-[250px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">Countries</div>
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
          name="countriesMode"
        />
      </div>
      <Stats className="h-24 w-full">
        <Stat className="flex items-center py-0">
          <StatValue
            className={classNames(
              theme === AppTheme.ABYSS ? 'text-accent' : 'text-accent/80',
            )}
          >
            {data?.topCountries.count}
          </StatValue>
          <StatTitle>Total Countries</StatTitle>
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
                renderTick: ({ value, x, y }: AxisTickProps<string>) => (
                  <>
                    <text
                      x={x - 55}
                      y={y + 4}
                      style={{
                        fill: 'oklch(from var(--color-base-content) l c h / 0.75)',
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontWeight: 600,
                        fontSize: '12px',
                        outlineWidth: '0px',
                        outlineColor: 'transparent',
                      }}
                    >
                      {value}
                    </text>
                    <image
                      x={x - 35}
                      y={y - 8}
                      height="16"
                      href={`/flags/svg/${value.toLowerCase()}.svg`}
                    />
                  </>
                ),
              }}
              margin={{
                left: 65,
              }}
              colors={[
                theme === AppTheme.ABYSS
                  ? 'var(--color-accent)'
                  : 'oklch(from var(--color-accent) l c h / 0.75)',
              ]}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.country}: ${tooltipData.data[
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
