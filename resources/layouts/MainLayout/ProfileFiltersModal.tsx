import { format, sub } from 'date-fns';
import { type Dispatch, type SetStateAction } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { FormControl, Modal, Select } from 'stratosphere-ui';

import { DATE_FORMAT_ISO } from '../../../app/constants';
import { MONTH_NAMES } from '../../common/constants';
import { useCurrentDate } from '../../common/hooks';
import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import { getIsLoggedIn, useAuthStore } from '../../stores';

export interface ProfileFiltersModalProps {
  methods: UseFormReturn<ProfileFilterFormData>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const ProfileFiltersModal = ({
  methods,
  open,
  setOpen,
}: ProfileFiltersModalProps): JSX.Element => {
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const currentDate = useCurrentDate();
  const [range, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['range', 'fromDate', 'toDate']
  >({
    control: methods.control,
    name: ['range', 'fromDate', 'toDate'],
  });
  return (
    <Modal
      actionButtons={[
        {
          color: 'error',
          children: 'Reset Filters',
          onClick: () => {
            methods.reset({
              status: 'completed',
              range: 'all',
              year: currentDate.getFullYear().toString(),
              month: (
                currentDate.getMonth() + 1
              ).toString() as ProfileFilterFormData['month'],
              fromDate: format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
              toDate: toDate ?? format(new Date(), DATE_FORMAT_ISO),
              searchQuery: '',
            });
          },
          outline: true,
        },
        {
          color: 'primary',
          children: 'Close',
          onClick: () => {
            setOpen(false);
          },
        },
      ]}
      className="overflow-visible bg-base-200"
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title="Apply Filters"
    >
      <div className="mt-4 flex gap-2">
        <div className="flex flex-1">
          {range !== 'pastMonth' &&
          range !== 'pastYear' &&
          range !== 'customRange' ? (
            <Select
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
              menuClassName="w-[175px]"
            />
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Select
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
            menuClassName="w-[175px] right-0"
          />
          {range === 'customRange' ? (
            <div className="flex flex-col gap-2 text-center text-sm">
              <FormControl name="fromDate" size="sm" type="date" max={toDate} />
              to
              <FormControl name="toDate" size="sm" type="date" min={fromDate} />
            </div>
          ) : null}
          {range === 'customMonth' ? (
            <Select
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
              menuClassName="w-[150px] right-0 max-h-[200px] overflow-y-scroll flex-nowrap"
            />
          ) : null}
          {range === 'customYear' || range === 'customMonth' ? (
            <Select
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
              menuClassName="w-[150px] right-0 max-h-[200px] overflow-y-scroll flex-nowrap"
            />
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
