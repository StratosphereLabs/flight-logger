import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Modal } from 'stratosphere-ui';
import { itineraryFlightSchema } from '../../../app/schemas/itineraries';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { itineraryBuilderDefaultValues } from './constants';
import { DeleteItineraryModal } from './DeleteItineraryModal';
import { type HomePageNavigationState } from './Home';
import { ItineraryBuilderFields } from './ItineraryBuilderFields';
import { ItineraryFlightsCard } from './ItineraryFlightsCard';
import { useItineraryFlightsStore } from './itineraryFlightsStore';
import { ResetItineraryModal } from './ResetItineraryModal';

export const CreateItineraryModal = (): JSX.Element => {
  const { state } = useLocation() as {
    state: HomePageNavigationState | null;
  };
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const {
    addFlight,
    flights,
    isCreateItineraryModalOpen,
    resetFlights,
    setIsCreateItineraryModalOpen,
  } = useItineraryFlightsStore();
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
  }, [isCreateItineraryModalOpen]);
  useEffect(() => {
    if (state?.createItinerary === true) {
      setIsCreateItineraryModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [state?.createItinerary]);
  return (
    <Modal
      title="Create Itinerary"
      open={isCreateItineraryModalOpen}
      onClose={() => {
        setIsCreateItineraryModalOpen(false);
      }}
      actionButtons={[]}
      className="w-full max-w-full overflow-x-hidden md:w-[75%]"
      ref={modalRef}
    >
      <div className="flex flex-col gap-4">
        {flights.length > 0 ? (
          <ItineraryFlightsCard
            isLoading={isLoading}
            onSubmit={() => {
              mutate({ flights });
            }}
          />
        ) : null}
        <Form
          className="w-full"
          methods={methods}
          onFormSubmit={data => {
            addFlight(data);
            resetForm();
          }}
        >
          <ItineraryBuilderFields />
        </Form>
        <DeleteItineraryModal />
        <ResetItineraryModal onSubmit={resetForm} />
      </div>
    </Modal>
  );
};
