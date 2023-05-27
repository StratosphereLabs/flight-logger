import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormRadio,
  Modal,
  integerInputTransformer,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';
import { FlightsRouterOutput } from '../../../app/routes/flights';
import { EditFlightRequest, editFlightSchema } from '../../../app/schemas';
import {
  AircraftTypeInput,
  AirframeInput,
  AirlineInput,
  AirportInput,
} from '../../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { editFlightDefaultValues } from './constants';
import { useFlightsPageStore } from './flightsPageStore';

export interface EditFlightProps {
  onSuccess: (data: FlightsRouterOutput['editFlight']) => void;
}

export const EditFlightModal = ({
  onSuccess,
}: EditFlightProps): JSX.Element => {
  const utils = trpc.useContext();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const methods = useForm<EditFlightRequest>({
    defaultValues: editFlightDefaultValues,
    resolver: zodResolver(editFlightSchema),
  });
  const tailNumber = methods.watch('tailNumber');
  const { activeFlight, isEditDialogOpen, setIsEditDialogOpen } =
    useFlightsPageStore();
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.flights.editFlight.useMutation({
    onSuccess: async newFlight => {
      handleSuccess('Flight Edited!');
      onSuccess(newFlight);
      setIsEditDialogOpen(false);
      await utils.users.invalidate();
    },
  });
  useTRPCErrorHandler(error);
  useEffect(() => {
    if (isEditDialogOpen) {
      modalRef.current?.scrollTo(0, 0);
      setTimeout(() => methods.setFocus('departureAirport'), 100);
    }
  }, [isEditDialogOpen]);
  useEffect(() => {
    if (activeFlight !== null) {
      methods.reset({
        id: activeFlight.id,
        departureAirport: activeFlight.departureAirport,
        arrivalAirport: activeFlight.arrivalAirport,
        airline: activeFlight.airline,
        aircraftType: activeFlight.aircraftType,
        flightNumber: activeFlight.flightNumber,
        callsign: activeFlight.callsign ?? '',
        tailNumber: activeFlight.tailNumber ?? '',
        outDateISO: activeFlight.outDateISO,
        outTimeValue: activeFlight.outTimeValue,
        inTimeValue: activeFlight.inTimeValue,
        class: activeFlight.class,
        seatNumber: activeFlight.seatNumber ?? '',
        seatPosition: activeFlight.seatPosition,
        reason: activeFlight.reason,
        comments: activeFlight.comments ?? '',
        trackingLink: activeFlight.trackingLink ?? '',
      });
    }
  }, [activeFlight]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: () => setIsEditDialogOpen(false),
        },
        {
          children: 'Save',
          color: 'primary',
          disabled: !methods.formState.isDirty,
          loading: isLoading,
          onClick: methods.handleSubmit(values => mutate(values)),
        },
      ]}
      className="overflow-x-hidden"
      onClose={() => setIsEditDialogOpen(false)}
      open={isEditDialogOpen}
      ref={modalRef}
      title="Edit Flight"
    >
      <Form className="flex flex-col gap-4" methods={methods}>
        <AirportInput
          isRequired
          labelText="Departure Airport"
          menuClassName="w-full"
          name="departureAirport"
          showDirty
        />
        <AirportInput
          isRequired
          labelText="Arrival Airport"
          menuClassName="w-full"
          name="arrivalAirport"
          showDirty
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Departure Date"
          name="outDateISO"
          showDirty
          type="date"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Departure Time (Local)"
          name="outTimeValue"
          showDirty
          transform={nullEmptyStringTransformer}
          type="time"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Arrival Time (Local)"
          name="inTimeValue"
          showDirty
          type="time"
        />
        <AirlineInput
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Airline"
          menuClassName="w-full"
          name="airline"
          showDirty
        />
        <AircraftTypeInput
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          menuClassName="w-full"
          name="aircraftType"
          showDirty
        />
        <FormControl
          className="w-[200px]"
          labelText="Flight Number"
          name="flightNumber"
          showDirty
          transform={integerInputTransformer}
        />
        <FormControl
          className="w-[200px]"
          labelText="Callsign"
          name="callsign"
          showDirty
        />
        <AirframeInput
          className="w-[200px]"
          labelText={`Registration (${tailNumber})`}
          name="airframe"
          showDirty
        />
        <FormRadio
          labelText="Class"
          name="class"
          options={[
            {
              id: 'BASIC',
              label: 'Basic Economy',
              value: 'BASIC',
            },
            {
              id: 'ECONOMY',
              label: 'Economy',
              value: 'ECONOMY',
            },
            {
              id: 'PREMIUM',
              label: 'Premium Economy',
              value: 'PREMIUM',
            },
            {
              id: 'BUSINESS',
              label: 'Business',
              value: 'BUSINESS',
            },
            {
              id: 'FIRST',
              label: 'First',
              value: 'FIRST',
            },
          ]}
          showDirty
        />
        <FormControl
          className="w-[200px]"
          labelText="Seat Number"
          name="seatNumber"
          showDirty
        />
        <FormRadio
          name="seatPosition"
          options={[
            {
              id: 'WINDOW',
              label: 'Window',
              value: 'WINDOW',
            },
            {
              id: 'MIDDLE',
              label: 'Middle',
              value: 'MIDDLE',
            },
            {
              id: 'AISLE',
              label: 'Aisle',
              value: 'AISLE',
            },
          ]}
          showDirty
        />
        <FormRadio
          labelText="Reason"
          name="reason"
          options={[
            {
              id: 'LEISURE',
              label: 'Leisure',
              value: 'LEISURE',
            },
            {
              id: 'BUSINESS',
              label: 'Business',
              value: 'BUSINESS',
            },
            {
              id: 'CREW',
              label: 'Crew',
              value: 'CREW',
            },
          ]}
          showDirty
        />
        <FormControl labelText="Comments" name="comments" showDirty />
        <FormControl labelText="Tracking Link" name="trackingLink" showDirty />
      </Form>
    </Modal>
  );
};
