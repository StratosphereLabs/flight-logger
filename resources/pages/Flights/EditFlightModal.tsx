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
import { editFlightDefaultValues } from './constants';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
} from '../../common/components';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { FlightsRouterOutput } from '../../../app/routes/flights';
import { UsersRouterOutput } from '../../../app/routes/users';
import { EditFlightRequest, editFlightSchema } from '../../../app/schemas';

export interface EditFlightProps {
  data: UsersRouterOutput['getUserFlights'][number] | null;
  onClose: () => void;
  onSuccess: (data: FlightsRouterOutput['editFlight']) => void;
  open: boolean;
}

export const EditFlightModal = ({
  data,
  onClose,
  onSuccess,
  open,
}: EditFlightProps): JSX.Element => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const methods = useForm<EditFlightRequest>({
    defaultValues: editFlightDefaultValues,
    resolver: zodResolver(editFlightSchema),
  });
  const handleSuccess = useSuccessResponseHandler();
  const { error, isLoading, mutate } = trpc.flights.editFlight.useMutation({
    onSuccess: newFlight => {
      handleSuccess('Flight Edited!');
      onSuccess(newFlight);
      onClose();
    },
  });
  useTRPCErrorHandler(error);
  useEffect(() => {
    if (open) {
      modalRef.current?.scrollTo(0, 0);
      setTimeout(() => methods.setFocus('departureAirportId'), 100);
    }
  }, [open]);
  useEffect(() => {
    if (data !== null) {
      methods.reset({
        id: data.id,
        departureAirportId: data.departureAirportId,
        arrivalAirportId: data.arrivalAirportId,
        airlineId: data.airlineId ?? '',
        aircraftTypeId: data.aircraftTypeId ?? '',
        flightNumber: data.flightNumber,
        callsign: data.callsign ?? '',
        tailNumber: data.tailNumber ?? '',
        outDateISO: data.outDateISO,
        outTimeValue: data.outTimeValue,
        inTimeValue: data.inTimeValue,
        class: data.class,
        seatNumber: data.seatNumber ?? '',
        seatPosition: data.seatPosition,
        reason: data.reason,
        comments: data.comments ?? '',
        trackingLink: data.trackingLink ?? '',
      });
    }
  }, [data]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'secondary',
          onClick: onClose,
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
      onClose={onClose}
      open={open}
      ref={modalRef}
      title="Edit Flight"
    >
      <Form className="flex flex-col gap-4" methods={methods}>
        <AirportInput
          defaultOptions={data !== null ? [data.departureAirport] : []}
          isRequired
          labelText="Departure Airport"
          menuClassName="w-full"
          name="departureAirportId"
          showDirty
        />
        <AirportInput
          defaultOptions={data !== null ? [data.arrivalAirport] : []}
          isRequired
          labelText="Arrival Airport"
          menuClassName="w-full"
          name="arrivalAirportId"
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
          defaultOptions={
            data?.airline !== undefined && data?.airline !== null
              ? [data.airline]
              : []
          }
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Airline"
          menuClassName="w-full"
          name="airlineId"
          showDirty
        />
        <AircraftTypeInput
          defaultOptions={
            data?.aircraftType !== undefined && data?.aircraftType !== null
              ? [data.aircraftType]
              : []
          }
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          menuClassName="w-full"
          name="aircraftTypeId"
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
        <FormControl
          className="w-[200px]"
          labelText="Registration"
          name="tailNumber"
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
