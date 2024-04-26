import { zodResolver } from '@hookform/resolvers/zod';
import { format, sub } from 'date-fns';
import { type UseFormReturn } from 'react-hook-form';
import { useFormWithQueryParams } from 'stratosphere-ui';
import { DATE_FORMAT_ISO } from '../../../../app/constants';
import { profileFiltersSchema } from '../../../../app/schemas';
import { useCurrentDate } from '../../../common/hooks';
import { useProfilePage } from './useProfilePage';

export interface ProfileFilterFormData {
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
}

export const useProfileFilterForm =
  (): UseFormReturn<ProfileFilterFormData> => {
    const currentDate = useCurrentDate();
    const { isAuthorized, isProfilePage } = useProfilePage();
    return useFormWithQueryParams<
      ProfileFilterFormData,
      ['range', 'year', 'month', 'fromDate', 'toDate']
    >({
      getDefaultValues: ({ range, year, month, fromDate, toDate }) => ({
        range: (range as ProfileFilterFormData['range']) ?? 'all',
        year: year ?? currentDate.getFullYear().toString(),
        month:
          (month as ProfileFilterFormData['month']) ??
          (currentDate.getMonth() + 1).toString(),
        fromDate:
          fromDate ?? format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
        toDate: toDate ?? format(new Date(), DATE_FORMAT_ISO),
      }),
      getSearchParams: ([range, year, month, fromDate, toDate]) => {
        const params = new URLSearchParams(
          isProfilePage && isAuthorized ? { range } : {},
        );
        if (range === 'customMonth') {
          params.set('month', month);
        }
        if (range === 'customMonth' || range === 'customYear') {
          params.set('year', year);
        }
        if (range === 'customRange') {
          params.set('fromDate', fromDate);
          params.set('toDate', toDate);
        }
        return params;
      },
      includeKeys: ['range', 'year', 'month', 'fromDate', 'toDate'],
      mode: 'onChange',
      resolver: zodResolver(profileFiltersSchema),
    });
  };
