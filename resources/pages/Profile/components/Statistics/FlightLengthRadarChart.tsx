import { ResponsiveRadar } from '@nivo/radar';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Loading, Select, Tooltip } from 'stratosphere-ui';

import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { type StatisticsFiltersData } from './StatisticsCard';
import { BAR_CHART_THEME, STATS_TOTALS_MODE_UNITS } from './constants';
import type { StatisticsChartProps } from './types';

export const FlightLengthRadarChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const mode = useWatch<StatisticsFiltersData, 'flightLengthMode'>({
    name: 'flightLengthMode',
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
  return (
    <div className="flex h-[205px] max-w-[500px] min-w-[274px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">Flight Length</div>
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
          name="flightLengthMode"
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
            <ResponsiveRadar
              theme={BAR_CHART_THEME}
              data={data.flightLengthData}
              keys={[mode]}
              indexBy="flightLength"
              margin={{ left: 55, top: 30, bottom: 25, right: 55 }}
              fillOpacity={0.5}
              gridLabelOffset={15}
              dotSize={8}
              dotColor="var(--color-base-300)"
              dotBorderWidth={2}
              colors={['var(--color-info)']}
              motionConfig="wobbly"
              sliceTooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.index}: ${tooltipData.data[0].value.toLocaleString()} ${
                    tooltipData.data[0].value !== 1 || mode !== 'flights'
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
