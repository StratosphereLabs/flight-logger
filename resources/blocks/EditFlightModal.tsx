import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
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

export interface EditFlightProps {
  data: UsersRouterOutput['getUserFlights'][number] | null;
  onClose: () => void;
  show: boolean;
}

export const EditFlightModal = ({
  data,
  onClose,
  show,
}: EditFlightProps): JSX.Element => {
  const { addAlertMessages } = useAlertMessages();
  const handleSuccess = useSuccessResponseHandler();
  const { isLoading, mutate } = trpc.flights.editFlight.useMutation({
    onSuccess: ({ id }) => {
      handleSuccess('Flight Edited!');
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
  const methods = useForm();
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
          loading: isLoading,
          onClick: () => mutate({}),
        },
      ]}
      onClose={onClose}
      show={show}
      title="Edit Flight"
    >
      <Form
        className="flex flex-col gap-4"
        methods={methods}
        onFormSubmit={() => {
          console.log('submit');
        }}
      >
        <AirportInput
          defaultOptions={data !== null ? [data.departureAirport] : []}
          isRequired
          labelText="Departure Airport"
          name="departureAirport"
        />
        <AirportInput
          defaultOptions={data !== null ? [data.arrivalAirport] : []}
          isRequired
          labelText="Arrival Airport"
          name="arrivalAirport"
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
          name="airline"
        />
        <AircraftTypeInput
          defaultOptions={
            data?.aircraftType !== undefined && data?.aircraftType !== null
              ? [data.aircraftType]
              : []
          }
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          name="aircraftType"
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
