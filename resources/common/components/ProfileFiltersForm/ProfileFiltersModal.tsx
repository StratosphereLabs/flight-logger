import { format, sub } from 'date-fns';
import { type Dispatch, type SetStateAction } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { FormControl, Modal, Select } from 'stratosphere-ui';

import { DATE_FORMAT_ISO } from '../../../../app/constants';
import { type ProfileFiltersFormData } from '../../../../app/schemas';
import { getIsLoggedIn, useAuthStore } from '../../../stores';
import { MONTH_NAMES } from '../../constants';
import { useCurrentDate } from '../../hooks';

export interface ProfileFiltersModalProps {
  methods: UseFormReturn<ProfileFiltersFormData>;
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
    ProfileFiltersFormData,
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
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              fromDate: format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
              toDate: toDate ?? format(new Date(), DATE_FORMAT_ISO),
              searchQuery: '',
            });
          },
          soft: true,
        },
        {
          color: 'primary',
          children: 'Close',
          onClick: () => {
            setOpen(false);
          },
          soft: true,
        },
      ]}
      className="bg-base-100 overflow-visible"
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title="Apply Filters"
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-1 justify-between gap-2">
          {range !== 'pastMonth' &&
          range !== 'pastYear' &&
          range !== 'customRange' ? (
            <Select
              buttonProps={{
                soft: true,
              }}
              className="relative w-[135px]"
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
              menuClassName="absolute w-[175px] bg-base-200 z-50"
            />
          ) : (
            <div />
          )}
          <Select
            buttonProps={{
              soft: true,
            }}
            className="relative w-[160px] text-nowrap"
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
            menuClassName="absolute w-[175px] right-0 bg-base-200 z-50"
          />
        </div>
        <div className="flex flex-col items-end gap-4">
          {range === 'customRange' ? (
            <div className="flex items-center gap-2">
              <FormControl
                className="min-w-[125px]"
                name="fromDate"
                type="date"
                max={toDate}
              />
              to
              <FormControl
                className="min-w-[125px]"
                name="toDate"
                type="date"
                min={fromDate}
              />
            </div>
          ) : null}
          <div className="flex gap-2">
            {range === 'customMonth' ? (
              <Select
                buttonProps={{
                  soft: true,
                }}
                className="relative w-[135px]"
                formValueMode="id"
                getItemText={({ label }) => label}
                name="month"
                options={[...Array(12).keys()].map(key => ({
                  id: key + 1,
                  label: MONTH_NAMES[key],
                }))}
                menuClassName="absolute w-[150px] right-0 max-h-[200px] overflow-y-scroll flex-nowrap bg-base-200 z-50"
              />
            ) : null}
            {range === 'customYear' || range === 'customMonth' ? (
              <Select
                buttonProps={{
                  soft: true,
                }}
                className="relative w-[95px]"
                formValueMode="id"
                getItemText={({ label }) => label}
                name="year"
                options={[...Array(75).keys()].map((_, index) => ({
                  id: currentDate.getFullYear() - index + 1,
                  label: `${currentDate.getFullYear() - index + 1}`,
                }))}
                menuClassName="absolute w-[150px] right-0 max-h-[200px] overflow-y-scroll flex-nowrap bg-base-200 z-50"
              />
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
};
