import { ResponsiveLine } from '@nivo/line';

import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { CloudIcon } from '../../common/components';
import { useIsDarkMode } from '../../stores';
import { BAR_CHART_THEME } from '../Profile/components/Statistics/constants';

export interface CloudCoverChartProps {
  data: NonNullable<
    FlightsRouterOutput['getExtraFlightData']['departureWeather']
  >;
}

export const CloudCoverChart = ({
  data,
}: CloudCoverChartProps): JSX.Element => {
  const isDarkMode = useIsDarkMode();
  return (
    <div className="h-[200px] w-full text-black">
      <ResponsiveLine
        theme={BAR_CHART_THEME}
        data={data.chartData.data}
        margin={{ top: 20, right: 0, bottom: 20, left: 55 }}
        xScale={{
          type: 'linear',
          min: 0,
          max: data.chartData.max,
          stacked: false,
        }}
        yScale={{ type: 'linear', min: 0, max: 400, stacked: false }}
        axisLeft={{
          tickSize: 0,
          legend: 'Altitude (FL)',
          legendOffset: -50,
          legendPosition: 'middle',
        }}
        enableGridX={false}
        lineWidth={0}
        axisBottom={null}
        pointSymbol={props => <CloudIcon {...props} />}
        useMesh={true}
        colors={[isDarkMode ? 'lightgray' : 'gray']}
        tooltip={() => null}
        sliceTooltip={() => null}
      />
    </div>
  );
};
