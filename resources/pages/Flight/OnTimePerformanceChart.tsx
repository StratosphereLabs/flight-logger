import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { Tooltip } from 'stratosphere-ui';

import { BAR_CHART_THEME } from '../../pages/Profile/components/Statistics/constants';
import { trpc } from '../../utils/trpc';

export interface OnTimePerformanceChartProps {
  flightId: string;
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
  const { data, isFetching } = trpc.flights.getExtraFlightData.useQuery({
    flightId,
  });
  return data?.onTimePerformance !== null &&
    data?.onTimePerformance !== undefined ? (
    <div className="flex h-[200px] w-full min-w-[250px] flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-base">On-Time Performance</div>
        <div className="flex text-xs opacity-80">
          <span>{data.onTimePerformance.onTimePercent}% on-time</span>
          <div className="divider divider-horizontal mx-0"></div>
          <span>Avg Delay {data.onTimePerformance.averageDelay}</span>
        </div>
      </div>
      <div className="relative h-full w-full">
        <div
          className={classNames(
            'h-full w-full transition-opacity',
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
    </div>
  ) : null;
};
