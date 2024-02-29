import { ResponsiveRadar } from '@nivo/radar';
import classNames from 'classnames';
import { type Control, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Loading, Select, Tooltip } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../../../common/hooks';
import { trpc } from '../../../../utils/trpc';
import { BAR_CHART_THEME, STATS_TOTALS_MODE_UNITS } from './constants';
import { type StatisticsFiltersData } from './Statistics';
import type { TotalsModeFormData } from './types';

export interface ReasonRadarChartProps {
  filtersFormControl: Control<StatisticsFiltersData>;
}

export const ReasonRadarChart = ({
  filtersFormControl,
}: ReasonRadarChartProps): JSX.Element => {
  const { username } = useParams();
  const methods = useForm<TotalsModeFormData>({
    defaultValues: {
      mode: 'flights',
    },
  });
  const mode = useWatch<TotalsModeFormData, 'mode'>({
    name: 'mode',
    control: methods.control,
  });
  const showUpcoming = useWatch<StatisticsFiltersData, 'statsShowUpcoming'>({
    name: 'statsShowUpcoming',
    control: filtersFormControl,
  });
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.statistics.getReasonDistribution.useQuery(
    {
      username,
      showUpcoming,
    },
    {
      trpc: {
        context: {
          skipBatch: true,
        },
      },
      keepPreviousData: true,
      onError,
    },
  );
  return (
    <div className="flex h-[185px] min-w-[229px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Flight Reason</div>
        <Form className="flex h-9 items-center" methods={methods}>
          <Select
            buttonProps={{ color: 'ghost', size: 'xs' }}
            formValueMode="id"
            getItemText={({ text }) => text}
            options={[
              {
                id: 'flights',
                text: 'Flights',
              },
              {
                id: 'distance',
                text: 'Distance (nm)',
              },
              {
                id: 'duration',
                text: 'Duration (min)',
              },
            ]}
            menuSize="sm"
            menuClassName="w-[185px] right-0"
            name="mode"
          />
        </Form>
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
              keys={[mode]}
              indexBy="reason"
              margin={{ left: 20, top: 30, bottom: 5, right: 20 }}
              fillOpacity={0.5}
              gridLabelOffset={15}
              dotSize={8}
              dotColor="oklch(var(--b3))"
              dotBorderWidth={2}
              colors={['oklch(var(--er))']}
              motionConfig="wobbly"
              sliceTooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.index}: ${tooltipData.data[0].value} ${
                    tooltipData.data[0].value !== 1 || mode !== 'flights'
                      ? STATS_TOTALS_MODE_UNITS[mode]
                      : STATS_TOTALS_MODE_UNITS[mode].slice(0, -1)
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
