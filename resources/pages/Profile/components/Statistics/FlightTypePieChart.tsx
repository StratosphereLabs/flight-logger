import { ResponsivePie } from '@nivo/pie';
import classNames from 'classnames';
import { type Control, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Loading, Select, Tooltip } from 'stratosphere-ui';
import { trpc } from '../../../../utils/trpc';
import { BAR_CHART_THEME, STATS_TOTALS_MODE_UNITS } from './constants';
import { type StatisticsFiltersData } from './Statistics';
import type { TotalsModeFormData } from './types';

export interface FlightTypePieChartProps {
  filtersFormControl: Control<StatisticsFiltersData>;
}

export const FlightTypePieChart = ({
  filtersFormControl,
}: FlightTypePieChartProps): JSX.Element => {
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
  const { data, isFetching } =
    trpc.statistics.getFlightTypeDistribution.useQuery(
      {
        username,
        mode,
        showUpcoming,
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
    <div className="flex h-[200px] min-w-[284px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Flight Type</div>
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
            <ResponsivePie
              theme={BAR_CHART_THEME}
              data={data}
              margin={{ top: 25, right: 40, bottom: 25, left: 40 }}
              colors={[
                'var(--fallback-er,oklch(var(--s)/0.75))',
                'var(--fallback-er,oklch(var(--a)/0.75))',
              ]}
              innerRadius={mode === 'flights' ? 0.5 : 0.2}
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
                    tooltipData.datum.data.value !== 1 || mode !== 'flights'
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
