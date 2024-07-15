import { type OnChangeFn, type RowSelectionState } from '@tanstack/react-table';
import { create } from 'zustand';
import { type FlightsRouterOutput } from '../../../app/routes/flights';

interface FlightsPageState {
  activeFlight: FlightsRouterOutput['getUserFlights']['results'][number] | null;
  isCreateTripDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  rowSelection: RowSelectionState;
  setActiveFlight: (
    flight: FlightsRouterOutput['getUserFlights']['results'][number] | null,
  ) => void;
  setIsCreateTripDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setRowSelection: OnChangeFn<RowSelectionState>;
  resetRowSelection: () => void;
}

export const useFlightsPageStore = create<FlightsPageState>()((set, get) => ({
  activeFlight: null,
  isCreateTripDialogOpen: false,
  isDeleteDialogOpen: false,
  isEditDialogOpen: false,
  isViewDialogOpen: false,
  rowSelection: {},
  setActiveFlight: activeFlight => {
    set({ activeFlight });
  },
  setIsCreateTripDialogOpen: isCreateTripDialogOpen => {
    set({ isCreateTripDialogOpen });
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
  setRowSelection: state => {
    set({
      rowSelection:
        typeof state === 'function' ? state(get().rowSelection) : state,
    });
  },
  resetRowSelection: () => {
    set({ rowSelection: {} });
  },
}));
