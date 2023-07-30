import { zodResolver } from '@hookform/resolvers/zod';
import { add, isBefore } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormRadio,
  Modal,
  integerInputTransformer,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import { type EditFlightRequest, editFlightSchema } from '../../../app/schemas';
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
  const [departureDate, tailNumber, airframe] = methods.watch([
    'outDateISO',
    'tailNumber',
    'airframe',
  ]);
  const shouldShowRegField = useMemo(
    () =>
      departureDate !== ''
        ? isBefore(new Date(departureDate), add(new Date(), { days: 3 }))
        : false,
    [departureDate],
  );
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
    if (airframe?.operator !== null && airframe?.operator !== undefined) {
      methods.setValue('airline', airframe.operator);
    }
  }, [airframe]);
  useEffect(() => {
    if (isEditDialogOpen) {
      modalRef.current?.scrollTo(0, 0);
      setTimeout(() => {
        methods.setFocus('departureAirport');
      }, 100);
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
        airframe: activeFlight.airframe,
        flightNumber: activeFlight.flightNumber,
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
          onClick: () => {
            setIsEditDialogOpen(false);
          },
        },
        {
          children: 'Save',
          color: 'primary',
          disabled: !methods.formState.isDirty,
          loading: isLoading,
          type: 'submit',
        },
      ]}
      className="overflow-x-hidden overflow-y-scroll scrollbar-none"
      onClose={() => {
        setIsEditDialogOpen(false);
      }}
      open={isEditDialogOpen}
      ref={modalRef}
      title="Edit Flight"
    >
      <Form
        className="flex flex-col gap-4"
        methods={methods}
        onFormSubmit={values => {
          mutate(values);
        }}
      >
        <AirportInput
          isRequired
          labelText="Departure Airport"
          inputClassName="bg-base-200"
          menuClassName="w-full"
          name="departureAirport"
          showDirty
        />
        <AirportInput
          isRequired
          labelText="Arrival Airport"
          inputClassName="bg-base-200"
          menuClassName="w-full"
          name="arrivalAirport"
          showDirty
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Departure Date"
          inputClassName="bg-base-200"
          name="outDateISO"
          showDirty
          type="date"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Departure Time (Local)"
          inputClassName="bg-base-200"
          name="outTimeValue"
          showDirty
          transform={nullEmptyStringTransformer}
          type="time"
        />
        <FormControl
          className="w-[200px]"
          isRequired
          labelText="Arrival Time (Local)"
          inputClassName="bg-base-200"
          name="inTimeValue"
          showDirty
          type="time"
        />
        {shouldShowRegField ? (
          <AirframeInput
            labelText={`Registration (${tailNumber})`}
            inputClassName="bg-base-200"
            menuClassName="w-full"
            name="airframe"
            showDirty
          />
        ) : null}
        <AirlineInput
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Airline"
          inputClassName="bg-base-200"
          menuClassName="w-full"
          name="airline"
          showDirty
        />
        <AircraftTypeInput
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          inputClassName="bg-base-200"
          menuClassName="w-full"
          name="aircraftType"
          showDirty
        />
        <FormControl
          className="w-[200px]"
          labelText="Flight Number"
          inputClassName="bg-base-200"
          name="flightNumber"
          showDirty
          transform={integerInputTransformer}
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
          inputClassName="bg-base-200"
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
        <FormControl
          labelText="Comments"
          inputClassName="bg-base-200"
          name="comments"
          showDirty
        />
        <FormControl
          labelText="Tracking Link"
          inputClassName="bg-base-200"
          name="trackingLink"
          showDirty
        />
      </Form>
    </Modal>
  );
};
