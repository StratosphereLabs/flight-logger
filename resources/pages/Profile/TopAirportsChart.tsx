import { Bar } from '@nivo/bar';
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
    <div className="flex flex-1 flex-col items-center gap-1">
      <div className="text-sm font-semibold">Top Airports</div>
      {data !== undefined ? (
        <Bar
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
          }}
          margin={{
            left: 60,
          }}
          height={150}
          width={250}
        />
      ) : null}
    </div>
  );
};
