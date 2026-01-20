import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from '@tanstack/react-router';
import { format, sub } from 'date-fns';
import { type UseFormReturn } from 'react-hook-form';

import { DATE_FORMAT_ISO } from '../../../../app/constants';
import { profileFiltersSchema } from '../../../../app/schemas';
import { useCurrentDate, useFormWithSearchParams } from '../../../common/hooks';

export interface ProfileFilterFormData {
  status: 'completed' | 'upcoming' | 'all';
  range:
    | 'all'
    | 'pastYear'
    | 'pastMonth'
    | 'customYear'
    | 'customMonth'
    | 'customRange';
  year: string;
  month:
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12';
  fromDate: string;
  toDate: string;
  searchQuery: string;
}

export const useProfileFilterForm =
  (): UseFormReturn<ProfileFilterFormData> => {
    const currentDate = useCurrentDate();
    const { pathname } = useLocation();
    const navigateFrom = pathname.includes('/profile')
      ? '/pathlessMainLayout/pathlessProfileLayout/profile'
      : '/pathlessMainLayout/pathlessProfileLayout/user/$username';
    return useFormWithSearchParams<
      ProfileFilterFormData,
      ['status', 'range', 'year', 'month', 'fromDate', 'toDate', 'searchQuery']
    >({
      from: navigateFrom,
      defaultValues: {
        status: 'completed',
        range: 'all',
        year: currentDate.getFullYear().toString(),
        month: (
          currentDate.getMonth() + 1
        ).toString() as ProfileFilterFormData['month'],
        fromDate: format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
        toDate: format(new Date(), DATE_FORMAT_ISO),
        searchQuery: '',
      },
      includeKeys: [
        'status',
        'range',
        'year',
        'month',
        'fromDate',
        'toDate',
        'searchQuery',
      ],
      mode: 'onChange',
      resolver: zodResolver(profileFiltersSchema),
    });
  };
