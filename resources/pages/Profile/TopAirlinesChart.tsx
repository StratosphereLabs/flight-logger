import { ResponsiveBar } from '@nivo/bar';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Select } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

interface TopAirlinesFormData {
  mode: 'flights' | 'distance' | 'duration';
}

export const TopAirlinesChart = (): JSX.Element => {
  const { username } = useParams();
  const methods = useForm<TopAirlinesFormData>({
    defaultValues: {
      mode: 'flights',
    },
  });
  const mode = useWatch<TopAirlinesFormData, 'mode'>({
    name: 'mode',
    control: methods.control,
  });
  const { data } = trpc.statistics.getTopAirlines.useQuery({
    username,
    limit: 5,
    mode,
  });
  return (
    <div className="flex min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex h-9 w-full items-center justify-between">
        <div className="text-sm font-semibold">Top Airlines</div>
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
            indexBy="airline"
            enableGridY={false}
            axisBottom={{
              tickSize: 0,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
            }}
            margin={{
              left: 55,
            }}
            colors={['var(--fallback-in,oklch(var(--in)/0.75))']}
            borderColor="#000000"
          />
        </div>
      ) : null}
    </div>
  );
};
