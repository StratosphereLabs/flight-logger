import { create } from 'zustand';
import { type UsersRouterOutput } from '../../../app/routes/users';

interface ItinerariesPageState {
  activeItinerary: UsersRouterOutput['getUserItineraries'][number] | null;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  setActiveItinerary: (
    flight: UsersRouterOutput['getUserItineraries'][number] | null,
  ) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
}

export const useItinerariesPageStore = create<ItinerariesPageState>()(set => ({
  activeItinerary: null,
  isDeleteDialogOpen: false,
  isEditDialogOpen: false,
  isViewDialogOpen: false,
  setActiveItinerary: activeItinerary => {
    set({ activeItinerary });
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
