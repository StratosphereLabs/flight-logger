import { type OnChangeFn, type RowSelectionState } from '@tanstack/react-table';
import { create } from 'zustand';

import { type FlightsRouterOutput } from '../../../app/routes/flights';

interface FlightsPageState {
  activeFlight: FlightsRouterOutput['getUserFlights']['results'][number] | null;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  rowSelection: RowSelectionState;
  setActiveFlight: (
    flight: FlightsRouterOutput['getUserFlights']['results'][number] | null,
  ) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setRowSelection: OnChangeFn<RowSelectionState>;
  resetRowSelection: () => void;
}

export const useFlightsPageStore = create<FlightsPageState>()((set, get) => ({
  activeFlight: null,
  isDeleteDialogOpen: false,
  isEditDialogOpen: false,
  rowSelection: {},
  setActiveFlight: activeFlight => {
    set({ activeFlight });
  },
  setIsDeleteDialogOpen: isDeleteDialogOpen => {
    set({ isDeleteDialogOpen });
  },
  setIsEditDialogOpen: isEditDialogOpen => {
    set({ isEditDialogOpen });
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
