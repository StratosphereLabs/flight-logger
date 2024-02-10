import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { Loading } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

export const TopAirportsChart = (): JSX.Element => {
  const { username } = useParams();
  const { data, isFetching } = trpc.statistics.getTopAirports.useQuery(
    {
      username,
      limit: 5,
    },
    {
      keepPreviousData: true,
    },
  );
  return (
    <div className="flex h-[180px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Top Airports</div>
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
              'h-full w-full transition-opacity',
              isFetching && 'opacity-50',
            )}
          >
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
    </div>
  );
};
