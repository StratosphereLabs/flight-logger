import { create } from 'zustand';

import { type FlightDataRouterOutput } from '../../../../../app/routes/flightData';
import { type FlightSearchFormData } from '../../../../../app/schemas';

interface AddFlightState {
  flightSearchFormData: FlightSearchFormData | null;
  isAddingFlight: boolean;
  isUserSelectModalOpen: boolean;
  selectedFlight:
    | FlightDataRouterOutput['searchFlightsByFlightNumber']['results'][number]
    | null;
  setFlightSearchFormData: (data: FlightSearchFormData | null) => void;
  setIsAddingFlight: (isAddingFlight: boolean) => void;
  setIsUserSelectModalOpen: (isOpen: boolean) => void;
  setSelectedFlight: (
    flight:
      | FlightDataRouterOutput['searchFlightsByFlightNumber']['results'][number]
      | null,
  ) => void;
}

export const useAddFlightStore = create<AddFlightState>()(set => ({
  flightSearchFormData: null,
  isAddingFlight: false,
  isUserSelectModalOpen: false,
  selectedFlight: null,
  setFlightSearchFormData: data => {
    set({ flightSearchFormData: data });
  },
  setIsAddingFlight: isAddingFlight => {
    set({ isAddingFlight });
  },
  setIsUserSelectModalOpen: isUserSelectModalOpen => {
    set({ isUserSelectModalOpen });
  },
  setSelectedFlight: selectedFlight => {
    set({ selectedFlight });
  },
}));
