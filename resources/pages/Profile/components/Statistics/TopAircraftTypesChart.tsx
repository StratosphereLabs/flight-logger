import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { type Control, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Loading, Select, Tooltip } from 'stratosphere-ui';
import { trpc } from '../../../../utils/trpc';
import { BAR_CHART_THEME, STATS_TOTALS_MODE_UNITS } from './constants';
import { type StatisticsFiltersData } from './Statistics';
import type { TotalsModeFormData } from './types';
import { useTRPCErrorHandler } from '../../../../common/hooks';

export interface TopAircraftTypeChartProps {
  filtersFormControl: Control<StatisticsFiltersData>;
}

export const TopAircraftTypesChart = ({
  filtersFormControl,
}: TopAircraftTypeChartProps): JSX.Element => {
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
  const { data, isFetching } = trpc.statistics.getTopAircraftTypes.useQuery(
    {
      username,
      limit: 5,
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
      onError,
    },
  );
  return (
    <div className="flex h-[180px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Top Aircraft Types</div>
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
              'h-full w-full transition-opacity',
              isFetching && 'opacity-50',
            )}
          >
            <ResponsiveBar
              theme={BAR_CHART_THEME}
              layout="horizontal"
              data={data}
              keys={[mode]}
              indexBy="aircraftType"
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
              colors={['var(--fallback-er,oklch(var(--er)/0.75))']}
              tooltip={tooltipData => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${tooltipData.data.aircraftType}: ${
                    tooltipData.data[mode]
                  } ${
                    tooltipData.data[mode] > 1
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
