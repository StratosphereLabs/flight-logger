import { ResponsivePie } from '@nivo/pie';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Loading, Select, Tooltip } from 'stratosphere-ui';

import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { AppTheme, useThemeStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { type StatisticsFiltersData } from './StatisticsCard';
import { BAR_CHART_THEME, STATS_TOTALS_MODE_UNITS } from './constants';
import type { StatisticsChartProps } from './types';

export const FlightTypePieChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const { theme } = useThemeStore();
  const mode = useWatch<StatisticsFiltersData, 'flightTypeMode'>({
    name: 'flightTypeMode',
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
        ? data.flightTypeData.map(flightType => ({
            ...flightType,
            value: flightType[mode],
          }))
        : [],
    [data, mode],
  );
  return (
    <div className="flex h-[200px] max-w-[500px] min-w-[284px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">Flight Type</div>
        <Select
          anchor="bottom end"
          buttonProps={{ color: 'ghost', size: 'sm' }}
          formValueMode="id"
          getItemText={({ text }) => text}
          options={[
            {
              id: 'flights',
              text: 'Flights',
            },
            {
              id: 'distance',
              text: 'Distance (mi)',
            },
            {
              id: 'duration',
              text: 'Duration (min)',
            },
          ]}
          menuClassName="w-[185px] bg-base-200 z-50"
          name="flightTypeMode"
        />
      </div>
      <div className="relative h-full w-full">
        {isFetching ? (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Loading shape="spinner" />
          </div>
        ) : null}
        {data !== undefined ? (
          <div
            className={classNames(
              'h-full w-full text-black transition-opacity',
              isFetching && 'opacity-50',
            )}
          >
            <ResponsivePie
              theme={BAR_CHART_THEME}
              data={chartData}
              arcLabel={d => d.data[mode].toLocaleString()}
              margin={{ top: 25, right: 40, bottom: 25, left: 40 }}
              colors={[
                'oklch(from var(--color-info) l c h / 0.5)',
                theme === AppTheme.ABYSS
                  ? 'var(--color-accent)'
                  : 'oklch(from var(--color-accent) l c h / 0.5)',
              ]}
              innerRadius={mode === 'flights' ? 0.5 : 0.2}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={4}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsStraightLength={10}
              arcLinkLabelsTextColor="oklch(from var(--color-base-content) l c h / 0.75)"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.datum.data.label}: ${tooltipData.datum.data[
                    mode
                  ].toLocaleString()} ${
                    tooltipData.datum.data[mode] !== 1 || mode !== 'flights'
                      ? STATS_TOTALS_MODE_UNITS[mode]
                      : STATS_TOTALS_MODE_UNITS[mode].slice(0, -1)
                  }`}
                />
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
