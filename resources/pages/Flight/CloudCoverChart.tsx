import { type LineSeries, ResponsiveLine } from '@nivo/line';
import classNames from 'classnames';
import { useMemo } from 'react';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { CloudIcon } from '../../common/components';
import { BAR_CHART_THEME } from '../Profile/components/Statistics/constants';
import { MAX_CLOUD_COLS } from './constants';
import { getCloudColumns, getRandomIntegers } from './utils';

export interface CloudCoverChartProps {
  data: NonNullable<
    FlightsRouterOutput['getExtraFlightData']['departureWeather']
  >;
}

export const CloudCoverChart = ({
  data,
}: CloudCoverChartProps): JSX.Element => {
  const chartData = useMemo(
    () =>
      data.clouds.reduce<LineSeries[]>(
        (acc1, { cover, base }) =>
          base !== null
            ? [
                ...acc1,
                {
                  id: base,
                  data: getRandomIntegers(
                    getCloudColumns(cover),
                    MAX_CLOUD_COLS,
                  ).map(col => ({
                    x: col,
                    y: base / 100,
                  })),
                },
              ]
            : acc1,
        [],
      ),
    [data.clouds],
  );
  return (
    <div
      className={classNames('h-[200px] w-full text-black transition-opacity')}
    >
      <ResponsiveLine
        theme={BAR_CHART_THEME}
        data={chartData}
        margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
        xScale={{
          type: 'linear',
          min: 0,
          max: MAX_CLOUD_COLS,
          stacked: false,
        }}
        yScale={{ type: 'linear', min: 0, max: 400, stacked: false }}
        axisLeft={{
          tickSize: 0,
          legend: 'Altitude (ft)',
          legendOffset: -60,
          legendPosition: 'middle',
        }}
        enableGridX={false}
        enableGridY={false}
        lineWidth={0}
        axisBottom={null}
        pointSymbol={props => <CloudIcon {...props} />}
        useMesh={true}
        colors={['lightgray']}
      />
    </div>
  );
};
