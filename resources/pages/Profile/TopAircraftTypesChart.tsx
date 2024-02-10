import { ResponsiveBar } from '@nivo/bar';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Select } from 'stratosphere-ui';
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
  const { data } = trpc.statistics.getTopAircraftTypes.useQuery({
    username,
    limit: 5,
    mode,
  });
  return (
    <div className="flex min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm font-semibold">Top Aircraft Types</div>
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
            menuClassName="w-[175px]"
            name="mode"
          />
        </Form>
      </div>
      {data !== undefined ? (
        <div className="h-[150px] w-full min-w-0">
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
  );
};
