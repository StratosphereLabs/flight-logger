import type { AxisTickProps } from '@nivo/axes';
import { ResponsiveBar } from '@nivo/bar';
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
import { BAR_CHART_THEME } from './constants';
import type { StatisticsChartProps } from './types';

export const TopCountriesChart = ({
  filtersFormControl,
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const mode = useWatch<StatisticsFiltersData, 'countriesMode'>({
    name: 'countriesMode',
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
  const { data, isFetching } = trpc.statistics.getTopCountries.useQuery(
    {
      username,
      limit: 5,
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
    <div className="flex h-[180px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Top Countries</div>
        <Select
          buttonProps={{ color: 'ghost', size: 'xs' }}
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
          menuSize="sm"
          menuClassName="w-[185px] right-0"
          name="countriesMode"
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
              'h-full w-full transition-opacity',
              isFetching && 'opacity-50',
            )}
          >
            <ResponsiveBar
              theme={BAR_CHART_THEME}
              layout="horizontal"
              data={data}
              keys={['flights']}
              indexBy="id"
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
                        fill: 'var(--fallback-bc,oklch(var(--bc)/0.75))',
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontWeight: 600,
                        fontSize: '11px',
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
                left: 55,
              }}
              colors={['var(--fallback-a,oklch(var(--a)/0.75))']}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.country}: ${
                    tooltipData.data.flights
                  } ${tooltipData.data.flights > 1 ? 'flights' : 'flight'}`}
                />
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
