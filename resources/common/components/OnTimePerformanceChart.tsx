import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { Tooltip } from 'stratosphere-ui';

import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from '../constants';
import { useCardClassNames } from '../hooks';

export interface OnTimePerformanceChartProps {
  flightId?: string;
}

const BAR_COLORS: Record<string, string> = {
  onTime: 'oklch(from var(--color-success) l c h / 0.75)',
  late: 'oklch(from var(--color-warning) l c h / 0.75)',
  veryLate: 'oklch(from var(--color-error) l c h / 0.75)',
  excessive: 'oklch(from var(--color-error) l c h / 0.75)',
  cancelled: 'oklch(from var(--color-error) l c h / 0.75)',
  diverted: 'oklch(from var(--color-error) l c h / 0.75)',
};

export const OnTimePerformanceChart = ({
  flightId,
}: OnTimePerformanceChartProps): JSX.Element | null => {
  const { data, isFetching } = trpc.flights.getExtraFlightData.useQuery(
    {
      flightId: flightId ?? '',
    },
    {
      enabled: flightId !== undefined,
    },
  );
  const cardClassNames = useCardClassNames();
  return data?.onTimePerformance !== null &&
    data?.onTimePerformance !== undefined ? (
    <div
      className={classNames(
        'flex w-full min-w-[250px] flex-col gap-3 font-semibold',
        cardClassNames,
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="text-base">On-Time Performance</div>
        <div className="flex text-xs opacity-80">
          <span>{data.onTimePerformance.onTimePercent}% on-time</span>
          <div className="divider divider-horizontal mx-0"></div>
          <span>Avg Delay {data.onTimePerformance.averageDelay}</span>
        </div>
      </div>
      <div
        className={classNames(
          'h-[175px] w-full transition-opacity',
          isFetching && 'opacity-50',
        )}
      >
        <ResponsiveBar
          theme={BAR_CHART_THEME}
          layout="horizontal"
          data={data.onTimePerformance.chartData}
          keys={['flights']}
          indexBy="label"
          enableGridY={false}
          axisBottom={{
            tickSize: 0,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 15,
          }}
          margin={{
            left: 120,
          }}
          colors={bar => BAR_COLORS[bar.data.id]}
          tooltip={tooltipData => (
            <Tooltip
              className="translate-y-[-20px]"
              open
              text={`${tooltipData.data.label}: ${tooltipData.data.flights.toLocaleString()} Flights`}
            />
          )}
        />
      </div>
    </div>
  ) : null;
};
