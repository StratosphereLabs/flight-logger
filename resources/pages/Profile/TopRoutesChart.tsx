import { ResponsiveBar } from '@nivo/bar';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, FormToggleSwitch } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { BAR_CHART_THEME } from './constants';

interface TopRoutesFormData {
  cityPairs: boolean;
}

export const TopRoutesChart = (): JSX.Element => {
  const { username } = useParams();
  const methods = useForm<TopRoutesFormData>({
    defaultValues: {
      cityPairs: false,
    },
  });
  const cityPairs = useWatch<TopRoutesFormData, 'cityPairs'>({
    name: 'cityPairs',
    control: methods.control,
  });
  const { data } = trpc.statistics.getTopRoutes.useQuery({
    username,
    limit: 5,
    cityPairs,
  });
  console.log({ data });
  const title = cityPairs ? 'Top City Pairs' : 'Top Routes';
  return (
    <div className="flex min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex w-full items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <Form methods={methods}>
          <FormToggleSwitch labelText="City Pairs" name="cityPairs" size="xs" />
        </Form>
      </div>
      {data !== undefined ? (
        <div className="h-[150px] w-full min-w-0">
          <ResponsiveBar
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
              left: 55,
            }}
            colors={['var(--fallback-wa,oklch(var(--wa)/0.75))']}
          />
        </div>
      ) : null}
    </div>
  );
};
