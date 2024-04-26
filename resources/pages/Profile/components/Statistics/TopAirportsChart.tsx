import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Loading, Select, Tooltip } from 'stratosphere-ui';
import {
  useCurrentUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { type ProfileFilterFormData } from '../../hooks';
import { BAR_CHART_THEME } from './constants';
import { type StatisticsFiltersData } from './Statistics';
import type { StatisticsChartProps } from './types';

export const TopAirportsChart = ({
  filtersFormControl,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams();
  const mode = useWatch<StatisticsFiltersData, 'airportsMode'>({
    name: 'airportsMode',
  });
  const onError = useTRPCErrorHandler();
  const { data: userData } = useCurrentUserQuery();
  const [range, year, month, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['range', 'year', 'month', 'fromDate', 'toDate']
  >({
    control: filtersFormControl,
    name: ['range', 'year', 'month', 'fromDate', 'toDate'],
  });
  const { data, isFetching } = trpc.statistics.getTopAirports.useQuery(
    {
      username,
      limit: 5,
      mode,
      showUpcoming: false,
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
    <div className="flex h-[180px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Top Airports</div>
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
          name="airportsMode"
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
              indexBy="airport"
              enableGridY={false}
              axisBottom={{
                tickSize: 0,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 20,
              }}
              margin={{
                left: 55,
              }}
              colors={['var(--fallback-su,oklch(var(--su)/0.75))']}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.airport}: ${
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
