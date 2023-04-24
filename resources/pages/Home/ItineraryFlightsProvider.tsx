import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { generateUUID } from '../../common/utils';
import {
  AddItineraryRequest,
  ItineraryFlight,
} from '../../../app/schemas/itineraries';

interface ItineraryFlightsContextData {
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

interface ItineraryFlightsProviderProps {
  children: ReactNode;
}

const initialContext: ItineraryFlightsContextData = {
  addFlight: () => undefined,
  deleteFlight: () => undefined,
  deleteFlightId: null,
  flights: [],
  isCreateItineraryModalOpen: false,
  isDeleteItineraryModalOpen: false,
  isResetItineraryModalOpen: false,
  resetFlights: () => undefined,
  setDeleteFlightId: () => undefined,
  setIsCreateItineraryModalOpen: () => undefined,
  setIsDeleteItineraryModalOpen: () => undefined,
  setIsResetItineraryModalOpen: () => undefined,
};

const ItineraryFlightsContext =
  createContext<ItineraryFlightsContextData>(initialContext);

export const useItineraryFlightsContext = (): ItineraryFlightsContextData =>
  useContext(ItineraryFlightsContext);

export const ItineraryFlightsProvider = ({
  children,
}: ItineraryFlightsProviderProps): JSX.Element => {
  const existingFlights = localStorage.getItem(
    'flight-logger-itinerary-flights',
  );
  const [deleteFlightId, setDeleteFlightId] = useState<string | null>(null);
  const [isCreateItineraryModalOpen, setIsCreateItineraryModalOpen] =
    useState(false);
  const [isDeleteItineraryModalOpen, setIsDeleteItineraryModalOpen] =
    useState(false);
  const [isResetItineraryModalOpen, setIsResetItineraryModalOpen] =
    useState(false);
  const [flights, setFlights] = useState<AddItineraryRequest>(
    existingFlights !== null
      ? (JSON.parse(existingFlights) as AddItineraryRequest)
      : [],
  );
  const addFlight = (flight: Omit<ItineraryFlight, 'id'>): void =>
    setFlights(prevFlights => [
      ...prevFlights,
      {
        id: generateUUID(),
        ...flight,
      },
    ]);
  const deleteFlight = (flightId: string): void =>
    setFlights(prevFlights => prevFlights.filter(({ id }) => id !== flightId));
  const resetFlights = (): void => setFlights([]);
  useEffect(() => {
    localStorage.setItem(
      'flight-logger-itinerary-flights',
      JSON.stringify(flights),
    );
  }, [flights]);
  return (
    <ItineraryFlightsContext.Provider
      value={{
        addFlight,
        deleteFlight,
        deleteFlightId,
        flights,
        isCreateItineraryModalOpen,
        isDeleteItineraryModalOpen,
        isResetItineraryModalOpen,
        resetFlights,
        setDeleteFlightId,
        setIsCreateItineraryModalOpen,
        setIsDeleteItineraryModalOpen,
        setIsResetItineraryModalOpen,
      }}
    >
      {children}
    </ItineraryFlightsContext.Provider>
  );
};
