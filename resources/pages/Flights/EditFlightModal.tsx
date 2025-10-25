import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { add, isBefore } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Form,
  FormControl,
  FormRadio,
  Modal,
  integerInputTransformer,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';

import { type EditFlightRequest, editFlightSchema } from '../../../app/schemas';
import {
  AircraftTypeInput,
  AirframeInput,
  AirlineInput,
  AirportInput,
} from '../../common/components';
import { HIDE_SCROLLBAR_CLASSNAME } from '../../common/constants';
import {
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { createNullableDate } from '../../utils/datetime';
import { trpc } from '../../utils/trpc';
import { customAirframe, editFlightDefaultValues } from './constants';
import { useFlightsPageStore } from './flightsPageStore';

export interface EditFlightProps {
  onSuccess: () => void;
}

export const EditFlightModal = ({
  onSuccess,
}: EditFlightProps): JSX.Element => {
  const utils = trpc.useUtils();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const methods = useForm<EditFlightRequest>({
    defaultValues: editFlightDefaultValues,
    resolver: zodResolver(editFlightSchema),
  });
  const [departureDate, airframe] = useWatch<
    EditFlightRequest,
    ['outDateISO', 'airframe']
  >({
    control: methods.control,
    name: ['outDateISO', 'airframe'],
  });
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
  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.flights.editFlight.useMutation({
    onSuccess: () => {
      handleSuccess('Flight Edited!');
      onSuccess();
      setIsEditDialogOpen(false);
      void utils.users.invalidate();
      void utils.flights.invalidate();
      void utils.statistics.invalidate();
    },
    onError,
  });
  useEffect(() => {
    if (
      airframe?.aircraftType !== null &&
      airframe?.aircraftType !== undefined
    ) {
      methods.setValue('aircraftType', airframe.aircraftType);
    }
    if (airframe?.operator !== null && airframe?.operator !== undefined) {
      methods.setValue('airline', airframe.operator);
    }
  }, [airframe, methods]);
  useEffect(() => {
    if (isEditDialogOpen) {
      modalRef.current?.scrollTo(0, 0);
      setTimeout(() => {
        methods.setFocus('departureAirport');
      }, 100);
    }
  }, [isEditDialogOpen, methods]);
  useEffect(() => {
    if (activeFlight !== null) {
      methods.reset({
        id: activeFlight.id,
        departureAirport: activeFlight.departureAirport,
        arrivalAirport: activeFlight.arrivalAirport,
        airline: activeFlight.airline ?? undefined,
        aircraftType: activeFlight.aircraftType,
        airframe:
          activeFlight.airframe !== null
            ? {
                ...activeFlight.airframe,
                type: 'existing',
                registrationDate: createNullableDate(
                  activeFlight.airframe.registrationDate,
                ),
                registrationExprDate: createNullableDate(
                  activeFlight.airframe.registrationExprDate,
                ),
                builtDate: createNullableDate(activeFlight.airframe.builtDate),
              }
            : activeFlight.tailNumber !== null &&
                activeFlight.tailNumber.length > 0
              ? {
                  ...customAirframe,
                  registration: activeFlight.tailNumber,
                }
              : null,
        flightNumber: activeFlight.flightNumber ?? undefined,
        outDateISO: activeFlight.outDateISO,
        outTimeValue: activeFlight.outTimeValue,
        inTimeValue: activeFlight.inTimeValue,
        class: activeFlight.class,
        seatNumber: activeFlight.seatNumber ?? '',
        seatPosition: activeFlight.seatPosition,
        reason: activeFlight.reason,
      });
    }
  }, [activeFlight, methods]);
  return (
    <Modal
      actionButtons={[]}
      className={classNames(
        'h-[95vh] overflow-x-hidden overflow-y-scroll',
        HIDE_SCROLLBAR_CLASSNAME,
      )}
      onClose={() => {
        setIsEditDialogOpen(false);
      }}
      open={isEditDialogOpen}
      ref={modalRef}
      title="Edit Flight"
    >
      <Form
        className="flex flex-col gap-4 pt-4"
        methods={methods}
        onFormSubmit={values => {
          mutate(values);
        }}
      >
        <AirportInput
          isRequired
          labelText="Departure Airport"
          inputClassName="bg-base-200"
          menuClassName="w-full bg-base-200 z-50"
          name="departureAirport"
          showDirty
        />
        <AirportInput
          isRequired
          labelText="Arrival Airport"
          inputClassName="bg-base-200"
          menuClassName="w-full bg-base-200 z-50"
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
            labelText="Registration"
            inputClassName="bg-base-200"
            menuClassName="w-full bg-base-200 z-50"
            name="airframe"
            showDirty
          />
        ) : null}
        <AirlineInput
          labelText="Airline"
          inputClassName="bg-base-200"
          menuClassName="w-full bg-base-200 z-50"
          name="airline"
          showDirty
        />
        <AircraftTypeInput
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          inputClassName="bg-base-200"
          menuClassName="w-full bg-base-200 z-50"
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
              id: 'ECONOMY',
              label: 'Economy',
              value: 'ECONOMY',
            },
            {
              id: 'PREMIUM',
              label: 'Premium',
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
        <div className="modal-action">
          <Button
            color="secondary"
            outline
            onClick={() => {
              setIsEditDialogOpen(false);
            }}
            soft
          >
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={!methods.formState.isDirty || isLoading}
            loading={isLoading}
            soft
            type="submit"
          >
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
