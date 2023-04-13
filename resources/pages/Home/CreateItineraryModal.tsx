import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Modal } from 'stratosphere-ui';
import { itineraryBuilderDefaultValues } from './constants';
import { ItineraryBuilderCard } from './ItineraryBuilderCard';
import { ItineraryFlightsCard } from './ItineraryFlightsCard';
import { ResetItineraryModal } from './ResetItineraryModal';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import {
  AddItineraryRequest,
  ItineraryFlight,
  itineraryFlightSchema,
} from '../../../app/schemas/itineraries';

export interface CreateItineraryModalProps {
  onClose: () => void;
  open: boolean;
}

export const CreateItineraryModal = ({
  onClose,
  open,
}: CreateItineraryModalProps): JSX.Element => {
  const existingFlights = localStorage.getItem(
    'flight-logger-itinerary-flights',
  );
  const navigate = useNavigate();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const flightsCardRef = useRef<HTMLDivElement | null>(null);
  const itineraryCardRef = useRef<HTMLDivElement | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [flights, setFlights] = useState<AddItineraryRequest>(
    existingFlights !== null
      ? (JSON.parse(existingFlights) as AddItineraryRequest)
      : [],
  );
  const addFlight = (flight: ItineraryFlight): void => {
    setFlights(prevFlights => [...prevFlights, flight]);
    methods.reset();
    firstFieldRef.current?.focus();
    setTimeout(() => flightsCardRef.current?.scrollIntoView());
  };
  const deleteFlight = (index: number): void =>
    setFlights(prevFlights => prevFlights.filter((_, idx) => index !== idx));
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: itineraryBuilderDefaultValues,
    resolver: zodResolver(itineraryFlightSchema),
  });
  const { error, isLoading, mutate } =
    trpc.itineraries.createItinerary.useMutation({
      onSuccess: response => navigate(`/itinerary/${response.id}`),
    });
  useTRPCErrorHandler(error);
  useEffect(() => {
    localStorage.setItem(
      'flight-logger-itinerary-flights',
      JSON.stringify(flights),
    );
  }, [flights]);
  return (
    <Modal
      title="Create Itinerary"
      open={open}
      onClose={onClose}
      actionButtons={[]}
      className="w-full max-w-full md:w-[75%]"
      responsive={false}
    >
      {flights.length > 0 ? (
        <ItineraryFlightsCard
          flights={flights}
          isLoading={isLoading}
          onDeleteFlight={deleteFlight}
          onReset={() => setIsResetDialogOpen(true)}
          onSubmit={() => mutate(flights)}
          ref={flightsCardRef}
        />
      ) : null}
      <Form className="w-full" methods={methods} onFormSubmit={addFlight}>
        <ItineraryBuilderCard
          firstFieldRef={firstFieldRef}
          onReset={() => setFlights([])}
          ref={itineraryCardRef}
        />
      </Form>
      <ResetItineraryModal
        onCancel={() => setIsResetDialogOpen(false)}
        onSubmit={() => {
          setFlights([]);
          setIsResetDialogOpen(false);
          firstFieldRef.current?.focus();
        }}
        open={isResetDialogOpen}
      />
    </Modal>
  );
};
