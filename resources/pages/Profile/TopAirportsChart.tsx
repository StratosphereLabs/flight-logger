import { ResponsiveBar } from '@nivo/bar';
import { useParams } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

export const TopAirportsChart = (): JSX.Element => {
  const { username } = useParams();
  const { data } = trpc.statistics.getTopAirports.useQuery({
    username,
    limit: 5,
  });
  return (
    <div className="flex min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Top Airports</div>
      </div>
      {data !== undefined ? (
        <div className="h-[150px] w-full">
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
              tickPadding: 15,
            }}
            margin={{
              left: 55,
            }}
            colors={['var(--fallback-su,oklch(var(--su)/0.75))']}
          />
        </div>
      ) : null}
    </div>
  );
};
