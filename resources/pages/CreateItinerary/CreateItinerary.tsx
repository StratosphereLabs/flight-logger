import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'stratosphere-ui';
import { itineraryFlightSchema } from '../../../app/schemas';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { itineraryBuilderDefaultValues } from './constants';
import { DeleteItineraryModal } from './DeleteItineraryModal';
import { ItineraryBuilderFields } from './ItineraryBuilderFields';
import { useItineraryFlightsStore } from './itineraryFlightsStore';
import { ItineraryFlightsCard } from './ItineraryFlightsCard';
import { ResetItineraryModal } from './ResetItineraryModal';

export const CreateItinerary = (): JSX.Element => {
  const {
    addFlight,
    flights,
    isCreateItineraryModalOpen,
    resetFlights,
    setIsCreateItineraryModalOpen,
  } = useItineraryFlightsStore();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: itineraryBuilderDefaultValues,
    resolver: zodResolver(itineraryFlightSchema.omit({ id: true })),
  });
  const resetForm = (): void => {
    methods.reset();
    setTimeout(() => {
      methods.setFocus('departureAirport');
    }, 250);
  };
  const { error, isLoading, mutate } =
    trpc.itineraries.createItinerary.useMutation({
      onSuccess: response => {
        setIsCreateItineraryModalOpen(false);
        navigate(`/itinerary/${response.id}`);
        resetFlights();
        void utils.users.invalidate();
      },
    });
  useTRPCErrorHandler(error);
  useEffect(() => {
    if (isCreateItineraryModalOpen) {
      modalRef.current?.scrollTo(0, 0);
      setTimeout(() => {
        methods.setFocus('departureAirport');
      }, 100);
    }
  }, [isCreateItineraryModalOpen, methods]);
  return (
    <>
      <article className="prose self-center">
        <h2>Create Itinerary</h2>
      </article>
      <Form
        className="flex w-full flex-col gap-4"
        methods={methods}
        onFormSubmit={data => {
          addFlight(data);
          resetForm();
        }}
      >
        {flights.length > 0 ? (
          <ItineraryFlightsCard
            isLoading={isLoading}
            onSubmit={() => {
              mutate({ flights });
            }}
          />
        ) : null}
        <ItineraryBuilderFields />
        <div className="divider my-2" />
        <div className="modal-action justify-center">
          <Button color="primary" className="w-full max-w-md" type="submit">
            Add Flight
          </Button>
        </div>
      </Form>
      <DeleteItineraryModal />
      <ResetItineraryModal onSubmit={resetForm} />
    </>
  );
};
