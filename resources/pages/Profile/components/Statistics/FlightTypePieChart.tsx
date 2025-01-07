import { ResponsivePie } from '@nivo/pie';
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

export const FlightTypePieChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const mode = useWatch<StatisticsFiltersData, 'flightTypeMode'>({
    name: 'flightTypeMode',
  });
  const onError = useTRPCErrorHandler();
  const { data: userData } = useProfileUserQuery();
  const [status, range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['status', 'range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { data, isFetching } =
    trpc.statistics.getFlightTypeDistribution.useQuery(
      {
        username,
        mode,
        status,
        range,
        year,
        month,
        fromDate,
        toDate,
        selectedAirportId,
      },
      {
        enabled: userData !== undefined,
        keepPreviousData: true,
        onError,
      },
    );
  return (
    <div className="flex h-[200px] min-w-[284px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">Flight Type</div>
        <Select
          buttonProps={{ color: 'ghost', size: 'xs' }}
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
          menuSize="sm"
          menuClassName="w-[185px] right-0"
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
              data={data}
              margin={{ top: 25, right: 40, bottom: 25, left: 40 }}
              colors={[
                'var(--fallback-er,oklch(var(--in)/0.50))',
                'var(--fallback-er,oklch(var(--a)/0.50))',
              ]}
              innerRadius={mode === 'flights' ? 0.5 : 0.2}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={4}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsStraightLength={10}
              arcLinkLabelsTextColor="var(--fallback-bc,oklch(var(--bc)/0.75))"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.datum.data.label}: ${
                    tooltipData.datum.data.value
                  } ${
                    tooltipData.datum.data.value !== 1 || mode !== 'flights'
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
