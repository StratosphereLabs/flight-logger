import { useMemo, useState } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { Button, Form, FormControl, Select } from 'stratosphere-ui';

import { FilterIcon, SearchIcon } from '../../common/components';
import { MONTH_NAMES } from '../../common/constants';
import { useCurrentDate } from '../../common/hooks';
import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import { getIsLoggedIn, useAuthStore } from '../../stores';
import { ProfileFiltersModal } from './ProfileFiltersModal';

export interface ProfileFiltersFormProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const ProfileFiltersForm = ({
  methods,
}: ProfileFiltersFormProps): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const currentDate = useCurrentDate();
  const [status, range, fromDate, toDate, year, month] = useWatch<
    ProfileFilterFormData,
    ['status', 'range', 'fromDate', 'toDate', 'year', 'month']
  >({
    control: methods.control,
    name: ['status', 'range', 'fromDate', 'toDate', 'year', 'month'],
  });
  const filterStatusText = useMemo(() => {
    const statusText = `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
    switch (range) {
      case 'all':
        return `All ${status !== 'all' ? statusText : ''}`;
      case 'pastMonth':
        return 'Past Month';
      case 'pastYear':
        return 'Past Year';
      case 'customYear':
        return `${statusText} ${year}`;
      case 'customMonth':
        return `${statusText} ${month}/${year}`;
      case 'customRange':
        return `${fromDate} → ${toDate}`;
      default:
        return '';
    }
  }, [fromDate, month, range, status, toDate, year]);
  return (
    <Form
      methods={methods}
      className="sticky top-0 z-10 flex w-full items-center justify-between gap-2 p-2"
    >
      <FormControl
        bordered
        className="max-w-[450px] min-w-[150px] flex-1"
        elementLeft={<SearchIcon className="h-4 w-4" />}
        inputClassName="bg-base-100 pl-8"
        name="searchQuery"
        placeholder="Search Flights..."
        size="sm"
      />
      <div className="hidden flex-nowrap gap-2 md:flex">
        {range !== 'pastMonth' &&
        range !== 'pastYear' &&
        range !== 'customRange' ? (
          <Select
            anchor="bottom end"
            buttonProps={{
              size: 'sm',
              color: 'neutral',
            }}
            className="w-[130px]"
            formValueMode="id"
            getItemText={({ label }) => label}
            name="status"
            options={[
              {
                id: 'completed',
                label: 'Completed',
              },
              ...(isLoggedIn
                ? [
                    {
                      id: 'upcoming',
                      label: 'Upcoming',
                    },
                    {
                      id: 'all',
                      label: 'All',
                    },
                  ]
                : []),
            ]}
            menuClassName="w-[175px] bg-base-200 z-50"
          />
        ) : null}
        {range === 'customRange' ? (
          <div className="flex items-center gap-2 text-sm">
            <FormControl name="fromDate" size="sm" type="date" max={toDate} />
            to
            <FormControl name="toDate" size="sm" type="date" min={fromDate} />
          </div>
        ) : null}
        {range === 'customMonth' ? (
          <Select
            anchor="bottom end"
            buttonProps={{
              size: 'sm',
              color: 'neutral',
            }}
            className="w-[130px]"
            formValueMode="id"
            getItemText={({ label }) => label}
            name="month"
            options={[...Array(12).keys()].map(key => ({
              id: (key + 1).toString(),
              label: MONTH_NAMES[key],
            }))}
            menuClassName="w-[150px] max-h-[200px] overflow-y-scroll flex-nowrap bg-base-200 z-50"
          />
        ) : null}
        {range === 'customYear' || range === 'customMonth' ? (
          <Select
            anchor="bottom end"
            buttonProps={{
              size: 'sm',
              color: 'neutral',
            }}
            className="w-[85px]"
            formValueMode="id"
            getItemText={({ label }) => label}
            name="year"
            options={[...Array(75).keys()].map((_, index) => ({
              id: `${currentDate.getFullYear() - index + 1}`,
              label: `${currentDate.getFullYear() - index + 1}`,
            }))}
            menuClassName="w-[150px] max-h-[200px] overflow-y-scroll flex-nowrap bg-base-200 z-50"
          />
        ) : null}
        <Select
          anchor="bottom end"
          buttonProps={{
            size: 'sm',
            color: 'neutral',
          }}
          className="w-[155px] text-nowrap"
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
          menuClassName="w-[175px] bg-base-200 z-50"
        />
      </div>
      <Button
        className="flex flex-nowrap md:hidden"
        onClick={() => {
          setIsFiltersDialogOpen(true);
        }}
        color="success"
        size="sm"
      >
        {filterStatusText}
        <FilterIcon className="h-6 w-5" />
      </Button>
      <ProfileFiltersModal
        methods={methods}
        open={isFiltersDialogOpen}
        setOpen={setIsFiltersDialogOpen}
      />
    </Form>
  );
};
