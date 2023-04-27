import { create } from 'zustand';

interface AccountPageState {
  isWarningDialogOpen: boolean;
  setIsWarningDialogOpen: (open: boolean) => void;
}

export const useAccountPageStore = create<AccountPageState>()(set => ({
  isWarningDialogOpen: false,
  setIsWarningDialogOpen: isWarningDialogOpen => {
    set({ isWarningDialogOpen });
  },
}));
