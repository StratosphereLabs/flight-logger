import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Form, FormControl, Select } from 'stratosphere-ui';
import { MONTH_NAMES } from '../../common/constants';
import {
  CompletedFlights,
  CurrentFlightCard,
  MapCard,
  Statistics,
  UpcomingFlights,
} from './components';
import { format, sub } from 'date-fns';
import { DATE_FORMAT_ISO } from '../../../app/constants';

export interface ProfileFilterFormData {
  range:
    | 'all'
    | 'pastYear'
    | 'pastMonth'
    | 'customYear'
    | 'customMonth'
    | 'customRange';
  year: string;
  month: string;
  fromDate: string;
  toDate: string;
}

export const Profile = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialParams] = useState(searchParams);
  const [isMapFullScreen, setIsMapFullScreen] = useState(
    initialParams.get('isMapFullScreen') === 'true',
  );
  const currentDate = useMemo(() => new Date(), []);
  const methods = useForm<ProfileFilterFormData>({
    defaultValues: {
      range: 'all',
      year: currentDate.getFullYear().toString(),
      month: (currentDate.getMonth() + 1).toString(),
      fromDate: format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
      toDate: format(new Date(), DATE_FORMAT_ISO),
    },
  });
  const range = useWatch<ProfileFilterFormData, 'range'>({
    control: methods.control,
    name: 'range',
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
        className="sticky top-0 z-10 flex w-full items-center justify-end gap-2 bg-gradient-to-b from-base-300 to-base-200/60 px-2 pb-2 shadow-md backdrop-blur-sm"
      >
        {range === 'customRange' ? (
          <div className="flex items-center gap-2 text-sm">
            <FormControl name="fromDate" size="xs" type="date" />
            to
            <FormControl name="toDate" size="xs" type="date" />
          </div>
        ) : null}
        {range === 'customMonth' ? (
          <Select
            buttonProps={{
              size: 'xs',
              color: 'neutral',
            }}
            className="w-[100px]"
            formValueMode="id"
            getItemText={({ label }) => label}
            name="month"
            options={[...Array(12).keys()].map(key => ({
              id: key + 1,
              label: MONTH_NAMES[key],
            }))}
            menuClassName="w-[150px] right-0 menu-sm sm:menu-md max-h-[200px] overflow-y-scroll flex-nowrap"
          />
        ) : null}
        {range === 'customYear' || range === 'customMonth' ? (
          <Select
            buttonProps={{
              size: 'xs',
              color: 'neutral',
            }}
            className="w-[100px]"
            formValueMode="id"
            getItemText={({ label }) => label}
            name="year"
            options={[...Array(75).keys()].map((_, index) => ({
              id: `${currentDate.getFullYear() - index}`,
              label: `${currentDate.getFullYear() - index}`,
            }))}
            menuClassName="w-[150px] right-0 menu-sm sm:menu-md max-h-[200px] overflow-y-scroll flex-nowrap"
          />
        ) : null}
        <Select
          buttonProps={{
            size: 'xs',
            color: 'neutral',
          }}
          className="w-[140px]"
          formValueMode="id"
          getItemText={({ label }) => label}
          name="range"
          options={[
            {
              id: 'all',
              label: 'All Time',
            },
            {
              id: 'pastYear',
              label: 'Past Year',
            },
            {
              id: 'pastMonth',
              label: 'Past Month',
            },
            {
              id: 'customYear',
              label: 'Custom Year',
            },
            {
              id: 'customMonth',
              label: 'Custom Month',
            },
            {
              id: 'customRange',
              label: 'Custom Range',
            },
          ]}
          menuClassName="w-[175px] right-0 menu-sm sm:menu-md"
        />
      </Form>
      <div className="flex flex-1 flex-col gap-3 overflow-y-scroll px-2 pb-2 pt-2 sm:px-3 sm:pb-3">
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
