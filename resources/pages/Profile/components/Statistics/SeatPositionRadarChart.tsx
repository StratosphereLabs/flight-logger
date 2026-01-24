import { ResponsiveRadar } from '@nivo/radar';
import { useParams } from '@tanstack/react-router';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import { Loading, Select, Tooltip } from 'stratosphere-ui';

import { BAR_CHART_THEME } from '../../../../common/constants';
import {
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { useProfileFiltersFormData } from '../../../../layouts/ProfileLayout';
import { trpc } from '../../../../utils/trpc';
import { type StatisticsFiltersData } from './StatisticsCard';
import { STATS_TOTALS_MODE_UNITS } from './constants';
import type { StatisticsChartProps } from './types';

export const SeatPositionRadarChart = ({
  selectedAirportId,
}: StatisticsChartProps): JSX.Element => {
  const { username } = useParams({
    from: '/pathlessProfileLayout/user/$username',
  });
  const mode = useWatch<StatisticsFiltersData, 'seatPositionMode'>({
    name: 'seatPositionMode',
  });
  const onError = useTRPCErrorHandler();
  const { data: userData } = useProfileUserQuery();
  const { status, range, year, month, fromDate, toDate, searchQuery } =
    useProfileFiltersFormData();
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
    <div className="flex h-[185px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">Seat Position</div>
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
          name="seatPositionMode"
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
              data={data.seatPositionData}
              keys={[mode]}
              indexBy="seatPosition"
              margin={{ left: 10, top: 30, bottom: 5, right: 10 }}
              fillOpacity={0.5}
              gridLabelOffset={15}
              dotSize={8}
              dotColor="var(--color-base-300)"
              dotBorderWidth={2}
              colors={['var(--color-warning)']}
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
