import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateUUID } from '../../common/utils';
import {
  AddItineraryRequest,
  ItineraryFlight,
} from '../../../app/schemas/itineraries';

interface ItineraryFlightsState {
  addFlight: (flight: Omit<ItineraryFlight, 'id'>) => void;
  deleteFlight: (id: string) => void;
  deleteFlightId: string | null;
  flights: AddItineraryRequest;
  isCreateItineraryModalOpen: boolean;
  isDeleteItineraryModalOpen: boolean;
  isResetItineraryModalOpen: boolean;
  setDeleteFlightId: (id: string) => void;
  setIsCreateItineraryModalOpen: (open: boolean) => void;
  setIsDeleteItineraryModalOpen: (open: boolean) => void;
  setIsResetItineraryModalOpen: (open: boolean) => void;
  resetFlights: () => void;
}

export const useItineraryFlightsStore = create<ItineraryFlightsState>()(
  persist(
    set => ({
      addFlight: flight => {
        set(({ flights }) => ({
          flights: [
            ...flights,
            {
              id: generateUUID(),
              ...flight,
            },
          ],
        }));
      },
      deleteFlight: flightId => {
        set(({ flights }) => ({
          flights: flights.filter(({ id }) => id !== flightId),
        }));
      },
      deleteFlightId: null,
      flights: [],
      isCreateItineraryModalOpen: false,
      isDeleteItineraryModalOpen: false,
      isResetItineraryModalOpen: false,
      setDeleteFlightId: deleteFlightId => {
        set({ deleteFlightId });
      },
      setIsCreateItineraryModalOpen: isCreateItineraryModalOpen => {
        set({ isCreateItineraryModalOpen });
      },
      setIsDeleteItineraryModalOpen: isDeleteItineraryModalOpen => {
        set({ isDeleteItineraryModalOpen });
      },
      setIsResetItineraryModalOpen: isResetItineraryModalOpen => {
        set({ isResetItineraryModalOpen });
      },
      resetFlights: () => {
        set({ flights: [] });
      },
    }),
    {
      name: 'flight-logger-itineraries',
      storage: createJSONStorage(() => localStorage),
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ['flights'].includes(key)),
        ),
    },
  ),
);
