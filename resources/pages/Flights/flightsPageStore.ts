import { create } from 'zustand';
import { UsersRouterOutput } from '../../../app/routes/users';

interface FlightsPageState {
  activeFlight: UsersRouterOutput['getUserFlights'][number] | null;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  setActiveFlight: (
    flight: UsersRouterOutput['getUserFlights'][number] | null,
  ) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
}

export const useFlightsPageStore = create<FlightsPageState>()(set => ({
  activeFlight: null,
  isDeleteDialogOpen: false,
  isEditDialogOpen: false,
  isViewDialogOpen: false,
  setActiveFlight: activeFlight => {
    set({ activeFlight });
  },
  setIsDeleteDialogOpen: isDeleteDialogOpen => {
    set({ isDeleteDialogOpen });
  },
  setIsEditDialogOpen: isEditDialogOpen => {
    set({ isEditDialogOpen });
  },
  setIsViewDialogOpen: isViewDialogOpen => {
    set({ isViewDialogOpen });
  },
}));
