import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Loading, Select } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

interface TopAircraftTypesFormData {
  mode: 'flights' | 'distance' | 'duration';
}

export const TopAircraftTypesChart = (): JSX.Element => {
  const { username } = useParams();
  const methods = useForm<TopAircraftTypesFormData>({
    defaultValues: {
      mode: 'flights',
    },
  });
  const mode = useWatch<TopAircraftTypesFormData, 'mode'>({
    name: 'mode',
    control: methods.control,
  });
  const { data, isFetching } = trpc.statistics.getTopAircraftTypes.useQuery(
    {
      username,
      limit: 5,
      mode,
    },
    {
      keepPreviousData: true,
    },
  );
  return (
    <div className="flex h-[180px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm">Top Aircraft Types</div>
        <Form methods={methods}>
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
            menuClassName="w-[175px] right-0"
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
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
