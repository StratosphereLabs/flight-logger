import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {Form, Modal} from 'stratosphere-ui';
import {
  AddItineraryRequest,
  ItineraryFlight,
  itineraryFlightSchema,
} from '../../../app/schemas/itineraries';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { itineraryBuilderDefaultValues } from './constants';
import { ItineraryBuilderCard } from './ItineraryBuilderCard';
import { ItineraryFlightsCard } from './ItineraryFlightsCard';
import { ResetItineraryModal } from './ResetItineraryModal';
import { WelcomeCard } from './WelcomeCard';

export const Home = (): JSX.Element => {
  const existingFlights = localStorage.getItem(
    'flight-logger-itinerary-flights',
  );
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const flightsCardRef = useRef<HTMLDivElement | null>(null);
  const itineraryCardRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: itineraryBuilderDefaultValues,
    resolver: zodResolver(itineraryFlightSchema),
  });
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

  const  [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <WelcomeCard
        onGetStarted={() => setIsItineraryModalOpen(true)}

      />

      <Modal
          title="Create Itinerary"
          open={isItineraryModalOpen}
          onClose={() => setIsItineraryModalOpen(false)}
          actionButtons={[]}
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
        {isResetDialogOpen ? (
            <ResetItineraryModal
                onCancel={() => setIsResetDialogOpen(false)}
                onSubmit={() => {
                  setFlights([]);
                  setIsResetDialogOpen(false);
                  firstFieldRef.current?.focus();
                }}
                open={isResetDialogOpen}
            />
        ) : null}
      </Modal>

      {/*
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
      {isResetDialogOpen ? (
        <ResetItineraryModal
          onCancel={() => setIsResetDialogOpen(false)}
          onSubmit={() => {
            setFlights([]);
            setIsResetDialogOpen(false);
            firstFieldRef.current?.focus();
          }}
          open={isResetDialogOpen}
        />
      ) : null}
        */}

    </div>
  );
};
