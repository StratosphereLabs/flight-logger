import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { Tooltip } from 'stratosphere-ui';

import { BAR_CHART_THEME } from '../../pages/Profile/components/Statistics/constants';
import { trpc } from '../../utils/trpc';

export interface OnTimePerformanceChartProps {
  flightId: string;
}

export const OnTimePerformanceChart = ({
  flightId,
}: OnTimePerformanceChartProps): JSX.Element => {
  const { data, isFetching } = trpc.flights.getExtraFlightData.useQuery({
    flightId,
  });
  return (
    <>
      {data?.onTimePerformance !== null &&
      data?.onTimePerformance !== undefined ? (
        <div className="mt-4 flex h-[200px] w-full min-w-[250px] flex-col items-center gap-1 font-semibold">
          <div className="flex h-9 w-full items-center justify-between">
            <div className="text-base">On-Time Performance</div>
            <div className="text-xs opacity-80">
              {data.onTimePerformance.onTimePercent}% on-time
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
                  left: 90,
                }}
                colors={['var(--fallback-er,oklch(var(--er)/0.75))']}
                tooltip={tooltipData => (
                  <Tooltip
                    className="translate-y-[-20px]"
                    open
                    text={`${tooltipData.data.label}: ${
                      tooltipData.data.flights
                    } Flights`}
                  />
                )}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
