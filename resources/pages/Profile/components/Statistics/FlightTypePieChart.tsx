import { ResponsivePie } from '@nivo/pie';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { Loading, Tooltip } from 'stratosphere-ui';
import { trpc } from '../../../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

export const FlightTypePieChart = (): JSX.Element => {
  const { username } = useParams();
  const { data, isFetching } =
    trpc.statistics.getFlightTypeDistribution.useQuery(
      {
        username,
      },
      {
        trpc: {
          context: {
            skipBatch: true,
          },
        },
        keepPreviousData: true,
      },
    );
  return (
    <div className="flex h-[200px] min-w-[290px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Flight Type</div>
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
            <ResponsivePie
              theme={BAR_CHART_THEME}
              data={data}
              margin={{ top: 25, right: 40, bottom: 25, left: 40 }}
              colors={[
                'var(--fallback-er,oklch(var(--s)/0.75))',
                'var(--fallback-er,oklch(var(--a)/0.75))',
              ]}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={4}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsStraightLength={10}
              arcLinkLabelsTextColor="var(--fallback-bc,oklch(var(--bc)/0.75))"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.datum.data.label}: ${
                    tooltipData.datum.data.value
                  } ${
                    tooltipData.datum.data.value !== 1 ? 'flights' : 'flight'
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
