import { useWatch, type UseFormReturn } from 'react-hook-form';
import { type ProfileFilterFormData } from '../../pages/Profile/hooks';
import { Form, FormControl, Select } from 'stratosphere-ui';
import { MONTH_NAMES } from '../../common/constants';
import { useCurrentDate } from '../../common/hooks';

export interface ProfileFiltersFormProps {
  methods: UseFormReturn<ProfileFilterFormData>;
}

export const ProfileFiltersForm = ({
  methods,
}: ProfileFiltersFormProps): JSX.Element => {
  const currentDate = useCurrentDate();
  const [range, fromDate, toDate] = useWatch<
    ProfileFilterFormData,
    ['range', 'fromDate', 'toDate']
  >({
    control: methods.control,
    name: ['range', 'fromDate', 'toDate'],
  });
  return (
    <Form
      methods={methods}
      className="sticky top-0 z-10 flex w-full items-center justify-end gap-2 px-2 pb-2 sm:px-3"
    >
      {range === 'customRange' ? (
        <div className="flex items-center gap-2 text-sm">
          <FormControl name="fromDate" size="xs" type="date" max={toDate} />
          to
          <FormControl name="toDate" size="xs" type="date" min={fromDate} />
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
            id: (key + 1).toString(),
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
  );
};
