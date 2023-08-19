import { create } from 'zustand';
import { type UsersRouterOutput } from '../../../app/routes/users';

interface TripsPageState {
  activeTrip: UsersRouterOutput['getUserTrips']['upcomingTrips'][number] | null;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  setActiveTrip: (
    trip: UsersRouterOutput['getUserTrips']['upcomingTrips'][number] | null,
  ) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
}

export const useTripsPageStore = create<TripsPageState>()(set => ({
  activeTrip: null,
  isDeleteDialogOpen: false,
  isEditDialogOpen: false,
  isViewDialogOpen: false,
  setActiveTrip: activeTrip => {
    set({ activeTrip });
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
