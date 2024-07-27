import { zodResolver } from '@hookform/resolvers/zod';
import { format, sub } from 'date-fns';
import { type UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useFormWithQueryParams } from 'stratosphere-ui';
import { DATE_FORMAT_ISO } from '../../../../app/constants';
import { profileFiltersSchema } from '../../../../app/schemas';
import { useCurrentDate } from '../../../common/hooks';
import { useProfilePage } from './useProfilePage';

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
}

export const useProfileFilterForm =
  (): UseFormReturn<ProfileFilterFormData> => {
    const currentDate = useCurrentDate();
    const { isAuthorized } = useProfilePage();
    const { username } = useParams();
    const defaultStatus = username === undefined ? 'all' : 'completed';
    return useFormWithQueryParams<
      ProfileFilterFormData,
      ['status', 'range', 'year', 'month', 'fromDate', 'toDate']
    >({
      getDefaultValues: ({ status, range, year, month, fromDate, toDate }) => ({
        status: (status as ProfileFilterFormData['status']) ?? defaultStatus,
        range: (range as ProfileFilterFormData['range']) ?? 'all',
        year: year ?? currentDate.getFullYear().toString(),
        month:
          (month as ProfileFilterFormData['month']) ??
          (currentDate.getMonth() + 1).toString(),
        fromDate:
          fromDate ?? format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
        toDate: toDate ?? format(new Date(), DATE_FORMAT_ISO),
      }),
      getSearchParams: ([status, range, year, month, fromDate, toDate]) => {
        const { pathname } = window.location;
        const isProfilePage =
          pathname.includes('/profile') || pathname.includes('/user/');
        if (!isProfilePage || !isAuthorized)
          return {
            status: '',
            range: '',
            month: '',
            year: '',
            fromDate: '',
            toDate: '',
          };
        return {
          status: status !== defaultStatus ? status : '',
          range: range !== 'all' ? range : '',
          month: range === 'customMonth' ? month : '',
          year: range === 'customMonth' || range === 'customYear' ? year : '',
          fromDate: range === 'customRange' ? fromDate : '',
          toDate: range === 'customRange' ? toDate : '',
        };
      },
      includeKeys: ['status', 'range', 'year', 'month', 'fromDate', 'toDate'],
      mode: 'onChange',
      resolver: zodResolver(profileFiltersSchema),
    });
  };
