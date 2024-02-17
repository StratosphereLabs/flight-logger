import { ResponsiveRadar } from '@nivo/radar';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { Loading, Tooltip } from 'stratosphere-ui';
import { trpc } from '../../../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

export const SeatPositionRadarChart = (): JSX.Element => {
  const { username } = useParams();
  const { data, isFetching } =
    trpc.statistics.getSeatPositionDistribution.useQuery(
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
    <div className="flex h-[180px] min-w-[215px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Seat Position</div>
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
            <ResponsiveRadar
              theme={BAR_CHART_THEME}
              data={data}
              keys={['flights']}
              indexBy="seatPosition"
              margin={{ left: 10, top: 25, bottom: 5, right: 10 }}
              fillOpacity={0.5}
              gridLabelOffset={15}
              dotSize={8}
              dotColor="oklch(var(--b3))"
              dotBorderWidth={2}
              colors={['oklch(var(--su))']}
              motionConfig="wobbly"
              sliceTooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.index}: ${tooltipData.data[0].value} ${
                    tooltipData.data[0].value !== 1 ? 'flights' : 'flight'
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
