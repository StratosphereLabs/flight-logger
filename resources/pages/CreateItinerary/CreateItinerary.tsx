import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardTitle, Form } from 'stratosphere-ui';
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
      onSuccess: async response => {
        setIsCreateItineraryModalOpen(false);
        await navigate({ to: `/itinerary/$id`, params: { id: response.id } });
        resetFlights();
        await utils.users.invalidate();
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
  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-scroll p-2 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:scrollbar">
        <Card className="bg-base-100 shadow-md">
          <CardBody className="justify-center">
            <CardTitle className="mb-5 justify-center text-2xl">
              Create Itinerary
            </CardTitle>
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
                <Button
                  color="primary"
                  className="w-full max-w-md"
                  type="submit"
                >
                  Add Flight
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
      <DeleteItineraryModal />
      <ResetItineraryModal onSubmit={resetForm} />
    </>
  );
};
