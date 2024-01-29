import { type Control, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Modal } from 'stratosphere-ui';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { type FlightsFormData } from './Flights';
import { useFlightsPageStore } from './flightsPageStore';

export interface DeleteFlightModelProps {
  formControl: Control<FlightsFormData>;
  isRowSelectEnabled: boolean;
}

export const DeleteFlightModal = ({
  formControl,
  isRowSelectEnabled,
}: DeleteFlightModelProps): JSX.Element => {
  const utils = trpc.useUtils();
  const { username } = useParams();
  const { activeFlight, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useFlightsPageStore();
  const layout = useWatch<FlightsFormData, 'layout'>({
    control: formControl,
    name: 'layout',
  });
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.flights.deleteFlight.useMutation({
    onSuccess: ({ id }) => {
      handleSuccess('Flight Deleted');
      setIsDeleteDialogOpen(false);
      const previousFlights = utils.users.getUserFlights.getData({
        username,
        withTrip: !isRowSelectEnabled,
        layout,
      });
      utils.users.getUserFlights.setData(
        { username, withTrip: !isRowSelectEnabled, layout },
        previousFlights !== undefined
          ? {
              upcomingFlights: previousFlights.upcomingFlights.filter(
                flight => flight.id !== id,
              ),
              currentFlights: previousFlights.currentFlights.filter(
                flight => flight.id !== id,
              ),
              completedFlights: previousFlights.completedFlights.filter(
                flight => flight.id !== id,
              ),
              total: previousFlights.total - 1,
            }
          : undefined,
      );
      void utils.users.invalidate();
    },
  });
  useTRPCErrorHandler(error);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          outline: true,
          onClick: () => {
            setIsDeleteDialogOpen(false);
          },
        },
        {
          children: 'Delete',
          color: 'primary',
          loading: isLoading,
          onClick: () => {
            activeFlight !== null && mutate({ id: activeFlight.id });
          },
        },
      ]}
      onClose={() => {
        setIsDeleteDialogOpen(false);
      }}
      open={isDeleteDialogOpen}
      title="Delete Flight"
    >
      <div className="pt-4">
        Are you sure you want to delete your{' '}
        <strong>
          {activeFlight?.departureAirportId ?? ''} -{' '}
          {activeFlight?.arrivalAirportId ?? ''}
        </strong>{' '}
        flight?
      </div>
    </Modal>
  );
};
