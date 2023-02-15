import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormRadio,
  Modal,
  useAlertMessages,
} from 'stratosphere-ui';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
} from '../common/components';
import { useSuccessResponseHandler } from '../common/hooks';
import {
  nullEmptyStringTransformer,
  numberInputTransformer,
} from '../common/transformers';
import { trpc } from '../utils/trpc';
import { UsersRouterOutput } from '../../app/routes/users';
import { FlightsRouterOutput } from '../../app/routes/flights';

export interface EditFlightProps {
  data: UsersRouterOutput['getUserFlights'][number] | null;
  onClose: () => void;
  onSuccess: (data: FlightsRouterOutput['editFlight']) => void;
  show: boolean;
}

export const EditFlightModal = ({
  data,
  onClose,
  onSuccess,
  show,
}: EditFlightProps): JSX.Element => {
  const { addAlertMessages } = useAlertMessages();
  const handleSuccess = useSuccessResponseHandler();
  const methods = useForm<UsersRouterOutput['getUserFlights'][number]>();
  const { isLoading, mutate } = trpc.flights.editFlight.useMutation({
    onSuccess: newFlight => {
      handleSuccess('Flight Edited!');
      onSuccess(newFlight);
      onClose();
    },
    onError: err => {
      addAlertMessages([
        {
          status: 'error',
          message: err.message,
        },
      ]);
    },
  });
  useEffect(() => {
    if (data !== null) {
      methods.reset(data);
    }
  }, [data]);
  return (
    <Modal
      actionButtons={[
        {
          children: 'Cancel',
          color: 'ghost',
          onClick: onClose,
        },
        {
          children: 'Save',
          color: 'success',
          disabled: !methods.formState.isDirty,
          loading: isLoading,
          onClick: methods.handleSubmit(values => {
            mutate({
              id: values.id,
              departureAirportId: values.departureAirportId,
              arrivalAirportId: values.arrivalAirportId,
              outDate: values.outDateISO,
              outTime: values.outTimeValue,
              inTime: values.inTimeValue,
              airlineId: values.airlineId ?? '',
              aircraftTypeId: values.aircraftTypeId ?? '',
              flightNumber: values.flightNumber,
              callsign: values.callsign ?? '',
              tailNumber: values.tailNumber ?? '',
              class: values.class,
              seatPosition: values.seatPosition,
              seatNumber: values.seatNumber ?? '',
              reason: values.reason,
              comments: values.comments ?? '',
              trackingLink: values.trackingLink ?? '',
            });
          }),
        },
      ]}
      onClose={onClose}
      show={show}
      title="Edit Flight"
    >
      <Form className="flex flex-col gap-4" methods={methods}>
        <AirportInput
          defaultOptions={data !== null ? [data.departureAirport] : []}
          isRequired
          labelText="Departure Airport"
          name="departureAirportId"
        />
        <AirportInput
          defaultOptions={data !== null ? [data.arrivalAirport] : []}
          isRequired
          labelText="Arrival Airport"
          name="arrivalAirportId"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Departure Date"
          name="outDateISO"
          type="date"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Departure Time (Local)"
          name="outTimeValue"
          transform={nullEmptyStringTransformer}
          type="time"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Arrival Time (Local)"
          name="inTimeValue"
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
          name="airlineId"
        />
        <AircraftTypeInput
          defaultOptions={
            data?.aircraftType !== undefined && data?.aircraftType !== null
              ? [data.aircraftType]
              : []
          }
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          name="aircraftTypeId"
        />
        <FormControl
          className="w-[200px]"
          labelText="Flight Number"
          name="flightNumber"
          onWheel={e => (e.target as HTMLInputElement).blur?.()}
          transform={numberInputTransformer}
          type="number"
        />
        <FormControl
          className="w-[200px]"
          labelText="Callsign"
          name="callsign"
        />
        <FormControl
          className="w-[200px]"
          labelText="Registration"
          name="tailNumber"
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
        />
        <FormControl
          className="w-[200px]"
          labelText="Seat Number"
          name="seatNumber"
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
        />
        <FormControl labelText="Comments" name="comments" />
        <FormControl labelText="Tracking Link" name="trackingLink" />
      </Form>
    </Modal>
  );
};
