import { Bar } from '@nivo/bar';
import { useParams } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

export const TopRoutesChart = (): JSX.Element => {
  const { username } = useParams();
  const { data } = trpc.statistics.getTopRoutes.useQuery({
    username,
    limit: 5,
  });
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div className="text-sm font-semibold">Top Routes</div>
      {data !== undefined ? (
        <Bar
          theme={BAR_CHART_THEME}
          layout="horizontal"
          data={data}
          keys={['flights']}
          indexBy="route"
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
