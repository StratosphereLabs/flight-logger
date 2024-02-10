import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, FormToggleSwitch, Loading } from 'stratosphere-ui';
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
  const { data, isFetching } = trpc.statistics.getTopRoutes.useQuery(
    {
      username,
      limit: 5,
      cityPairs,
    },
    {
      keepPreviousData: true,
    },
  );
  const title = cityPairs ? 'Top City Pairs' : 'Top Routes';
  return (
    <div className="flex h-[180px] min-w-[250px] max-w-[500px] flex-1 flex-col items-center gap-1 font-semibold">
      <div className="flex w-full items-center justify-between">
        <div className="text-sm">{title}</div>
        <Form methods={methods}>
          <FormToggleSwitch labelText="City Pairs" name="cityPairs" size="xs" />
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
    </div>
  );
};
