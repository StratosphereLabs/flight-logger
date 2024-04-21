import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Form, Select } from 'stratosphere-ui';
import {
  CompletedFlights,
  CurrentFlightCard,
  MapCard,
  Statistics,
  UpcomingFlights,
} from './components';

export const Profile = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialParams] = useState(searchParams);
  const [isMapFullScreen, setIsMapFullScreen] = useState(
    initialParams.get('isMapFullScreen') === 'true',
  );
  const methods = useForm({
    defaultValues: {
      range: 'all',
    },
  });
  useEffect(() => {
    setSearchParams(oldSearchParams => ({
      ...Object.fromEntries(oldSearchParams),
      isMapFullScreen: isMapFullScreen.toString(),
    }));
  }, [isMapFullScreen, setSearchParams]);
  return (
    <div className="flex flex-1 flex-col">
      <Form
        methods={methods}
        className="sticky top-0 z-10 flex w-full items-center justify-end bg-base-200 p-2 shadow-lg"
      >
        <Select
          buttonProps={{
            size: 'xs',
            color: 'neutral',
          }}
          className="w-[150px]"
          formValueMode="id"
          getItemText={({ label }) => label}
          name="range"
          options={[
            {
              id: 'all',
              label: 'All Time',
              value: 'all',
            },
            {
              id: 'year',
              label: 'Past Year',
              value: 'year',
            },
            {
              id: 'month',
              label: 'Past Month',
              value: 'month',
            },
            {
              id: 'week',
              label: 'Past Week',
              value: 'week',
            },
            {
              id: 'custom',
              label: 'Custom',
              value: 'custom',
            },
          ]}
          menuSize="xs"
          menuClassName="w-full bg-base-200"
        />
      </Form>
      <div className="flex flex-1 flex-col gap-4 overflow-y-scroll px-2 pb-2 pt-1 sm:px-3 sm:pb-3">
        <div className="flex flex-wrap gap-4">
          <MapCard
            isMapFullScreen={isMapFullScreen}
            setIsMapFullScreen={setIsMapFullScreen}
          />
        </div>
        <CurrentFlightCard />
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex flex-row flex-wrap gap-4 lg:flex-col">
            <UpcomingFlights />
            <CompletedFlights />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            {/* {username === undefined ? (
              <div className="flex flex-col">
                <article className="prose p-1">
                  <h4 className="m-0">Add Flight</h4>
                </article>
                <Card className="bg-base-200 shadow-md" compact>
                  <CardBody className="gap-4">
                    <AddFlightForm />
                  </CardBody>
                </Card>
              </div>
            ) : null} */}
            <Statistics />
          </div>
        </div>
      </div>
    </div>
  );
};
