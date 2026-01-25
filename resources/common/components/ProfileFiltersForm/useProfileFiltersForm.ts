import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import { profileFiltersSchema } from '../../../../app/schemas';
import { useProfileLayoutStore } from '../../../layouts/ProfileLayout';
import { useFormWithSearchParams } from '../../hooks';
import { PROFILE_FILTERS_FORM_DEFAULT_VALUES } from './constants';

export interface ProfileFiltersFormData {
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

export const useProfileFiltersForm =
  (): UseFormReturn<ProfileFiltersFormData> => {
    const { pathname } = useLocation();
    const navigateFrom = pathname.includes('/profile')
      ? '/pathlessProfileLayout/profile'
      : '/pathlessProfileLayout/user/$username';
    const methods = useFormWithSearchParams<
      ProfileFiltersFormData,
      ['status', 'range', 'year', 'month', 'fromDate', 'toDate', 'searchQuery']
    >({
      from: navigateFrom,
      defaultValues: PROFILE_FILTERS_FORM_DEFAULT_VALUES,
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
    const { setProfileFiltersFormData } = useProfileLayoutStore();
    useEffect(() => {
      const subscription = methods.watch(() => {
        setProfileFiltersFormData(methods.getValues());
      });
      return () => {
        subscription.unsubscribe();
      };
    }, [methods, setProfileFiltersFormData]);
    return methods;
  };
