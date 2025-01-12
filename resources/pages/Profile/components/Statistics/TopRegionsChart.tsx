import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
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
  const { data, isFetching } = trpc.statistics.getTopRegions.useQuery(
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
      searchQuery,
    },
    {
      enabled: userData !== undefined,
      keepPreviousData: true,
      onError,
    },
  );
  return (
    <div className="flex h-[250px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-lg">Regions</div>
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
          name="regionsMode"
        />
      </div>
      <Stats className="h-24 w-full">
        <Stat className="flex items-center py-0">
          <StatValue className="text-info/80">{data?.count}</StatValue>
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
              data={data.chartData}
              keys={['flights']}
              indexBy="id"
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
              colors={['var(--fallback-in,oklch(var(--in)/0.75))']}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.region}: ${
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
