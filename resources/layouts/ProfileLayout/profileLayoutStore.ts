import { create } from 'zustand';

import { type ProfileFiltersFormData } from '../../common/components';
import { PROFILE_FILTERS_FORM_DEFAULT_VALUES } from '../../common/components/ProfileFiltersForm/constants';

interface ProfileLayoutState {
  profileFiltersFormData: ProfileFiltersFormData;
  setProfileFiltersFormData: (data: ProfileFiltersFormData) => void;
}

export const useProfileLayoutStore = create<ProfileLayoutState>()(set => ({
  profileFiltersFormData: PROFILE_FILTERS_FORM_DEFAULT_VALUES,
  setProfileFiltersFormData: (
    profileFiltersFormData: ProfileFiltersFormData,
  ) => {
    set({ profileFiltersFormData });
  },
}));

export const useProfileFiltersFormData = (): ProfileFiltersFormData =>
  useProfileLayoutStore(({ profileFiltersFormData }) => profileFiltersFormData);
