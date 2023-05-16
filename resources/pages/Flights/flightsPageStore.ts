import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { create } from 'zustand';
import { UsersRouterOutput } from '../../../app/routes/users';

interface FlightsPageState {
  activeFlight: UsersRouterOutput['getUserFlights'][number] | null;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  rowSelection: RowSelectionState;
  setActiveFlight: (
    flight: UsersRouterOutput['getUserFlights'][number] | null,
  ) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setRowSelection: OnChangeFn<RowSelectionState>;
  resetRowSelection: () => void;
}

export const useFlightsPageStore = create<FlightsPageState>()((set, get) => ({
  activeFlight: null,
  isDeleteDialogOpen: false,
  isEditDialogOpen: false,
  isViewDialogOpen: false,
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
