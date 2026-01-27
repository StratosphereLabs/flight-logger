import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import {
  type ProfileFiltersFormData,
  profileFiltersSchema,
} from '../../../../app/schemas';
import { useProfileLayoutStore } from '../../../layouts/ProfileLayout';
import { useFormWithSearchParams } from '../../hooks';
import { PROFILE_FILTERS_FORM_DEFAULT_VALUES } from './constants';

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
      resetScroll: true,
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
