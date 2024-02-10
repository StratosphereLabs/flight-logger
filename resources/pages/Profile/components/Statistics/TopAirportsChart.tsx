import { ResponsiveBar } from '@nivo/bar';
import classNames from 'classnames';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Form, Loading, Select, Tooltip } from 'stratosphere-ui';
import { trpc } from '../../../../utils/trpc';
import { BAR_CHART_THEME } from './constants';
import type { AirportsModeFormData } from './types';

export const TopAirportsChart = (): JSX.Element => {
  const { username } = useParams();
  const methods = useForm<AirportsModeFormData>({
    defaultValues: {
      mode: 'all',
    },
  });
  const mode = useWatch<AirportsModeFormData, 'mode'>({
    name: 'mode',
    control: methods.control,
  });
  const { data, isFetching } = trpc.statistics.getTopAirports.useQuery(
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
        <div className="text-sm">Top Airports</div>
        <Form className="flex h-9 items-center" methods={methods}>
          <Select
            buttonProps={{ color: 'ghost', size: 'xs' }}
            formValueMode="id"
            getItemText={({ text }) => text}
            options={[
              {
                id: 'all',
                text: 'All',
              },
              {
                id: 'departure',
                text: 'Departure',
              },
              {
                id: 'arrival',
                text: 'Arrival',
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
              keys={['flights']}
              indexBy="airport"
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
              colors={['var(--fallback-su,oklch(var(--su)/0.75))']}
              tooltip={data => (
                <Tooltip
                  className="translate-y-[-20px]"
                  open
                  text={`${data.data.airport}: ${data.data.flights} ${
                    data.data.flights > 1 ? 'flights' : 'flight'
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
