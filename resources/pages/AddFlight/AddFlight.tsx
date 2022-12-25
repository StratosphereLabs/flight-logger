import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { Button, Card, Divider } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { addFlightSchema } from '../../../app/schemas';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
  Form,
  FormControl,
  FormRadio,
  LoadingCard,
} from '../../common/components';
import {
  useProtectedPage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import {
  nullEmptyStringTransformer,
  numberInputTransformer,
} from '../../common/transformers';
import { trpc } from '../../utils/trpc';
import { addFlightDefaultValues } from './constants';

export const AddFlight = (): JSX.Element => {
  useProtectedPage();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: addFlightDefaultValues,
    resolver: zodResolver(addFlightSchema),
  });
  const handleSuccess = useSuccessResponseHandler();
  const { error, mutate, isLoading } = trpc.users.addFlight.useMutation({
    onSuccess: () => {
      handleSuccess('Flight Added!');
      methods.reset();
      firstFieldRef.current?.focus();
    },
  });
  useTRPCErrorHandler(error);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);
  return (
    <LoadingCard className="shadow-xl bg-base-200 min-h-[400px] min-w-[500px] overflow-visible">
      <Card.Body>
        <Card.Title className="mb-5 justify-center text-2xl">
          Add a Flight
        </Card.Title>
        <Form methods={methods} onFormSubmit={values => mutate(values)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <AirportInput
                  className="max-w-sm"
                  inputRef={firstFieldRef}
                  isRequired
                  labelText="Departure Airport"
                  name="departureAirportId"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <AirportInput
                  className="max-w-sm"
                  isRequired
                  labelText="Arrival Airport"
                  name="arrivalAirportId"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <FormControl
                  className="w-[200px]"
                  isRequired
                  labelText="Departure Date"
                  name="outDate"
                  type="date"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  className="w-[200px]"
                  isRequired
                  labelText="Departure Time (Local)"
                  name="outTime"
                  transform={nullEmptyStringTransformer}
                  type="time"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  className="w-[200px]"
                  isRequired
                  labelText="Arrival Time (Local)"
                  name="inTime"
                  type="time"
                />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <AirlineInput
                  className="max-w-sm"
                  labelText="Airline"
                  name="airlineId"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <AircraftTypeInput
                  className="max-w-sm"
                  labelText="Aircraft Type"
                  name="aircraftTypeId"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <FormControl
                  className="w-[200px]"
                  labelText="Flight Number"
                  name="flightNumber"
                  onWheel={e => (e.target as HTMLInputElement).blur?.()}
                  transform={numberInputTransformer}
                  type="number"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  className="w-[200px]"
                  labelText="Callsign"
                  name="callsign"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  className="w-[200px]"
                  labelText="Registration"
                  name="tailNumber"
                />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-12">
              <div className="flex-1 min-w-[200px]">
                <FormRadio
                  labelText="Class"
                  name="class"
                  options={[
                    {
                      label: 'Basic Economy',
                      value: 'BASIC',
                    },
                    {
                      label: 'Economy',
                      value: 'ECONOMY',
                    },
                    {
                      label: 'Premium Economy',
                      value: 'PREMIUM',
                    },
                    {
                      label: 'Business',
                      value: 'BUSINESS',
                    },
                    {
                      label: 'First',
                      value: 'FIRST',
                    },
                  ]}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <FormControl
                  className="mb-5 w-[200px]"
                  labelText="Seat Number"
                  name="seatNumber"
                />
                <FormRadio
                  name="seatPosition"
                  options={[
                    {
                      label: 'Window',
                      value: 'WINDOW',
                    },
                    {
                      label: 'Middle',
                      value: 'MIDDLE',
                    },
                    {
                      label: 'Aisle',
                      value: 'AISLE',
                    },
                  ]}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <FormRadio
                  labelText="Reason"
                  name="reason"
                  options={[
                    {
                      label: 'Leisure',
                      value: 'LEISURE',
                    },
                    {
                      label: 'Business',
                      value: 'BUSINESS',
                    },
                    {
                      label: 'Crew',
                      value: 'CREW',
                    },
                  ]}
                />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-8 mb-8">
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Comments" name="comments" />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Tracking Link" name="trackingLink" />
              </div>
            </div>
            <Button loading={isLoading} type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Card.Body>
    </LoadingCard>
  );
};
