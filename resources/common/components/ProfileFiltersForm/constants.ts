import { format, sub } from 'date-fns';

import { DATE_FORMAT_ISO } from '../../../../app/constants';
import { type ProfileFiltersFormData } from './useProfileFiltersForm';

export const PROFILE_FILTERS_FORM_DEFAULT_VALUES: ProfileFiltersFormData = {
  status: 'completed',
  range: 'all',
  year: new Date().getFullYear().toString(),
  month: (
    new Date().getMonth() + 1
  ).toString() as ProfileFiltersFormData['month'],
  fromDate: format(sub(new Date(), { months: 3 }), DATE_FORMAT_ISO),
  toDate: format(new Date(), DATE_FORMAT_ISO),
  searchQuery: '',
};
