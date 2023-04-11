import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { Button, Card, Divider } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormRadio,
  LoadingCard,
  integerInputTransformer,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';
import { addFlightDefaultValues } from './constants';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
} from '../../common/components';
import {
  useProtectedPage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { addFlightSchema } from '../../../app/schemas';

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
  const { error, mutate, isLoading } = trpc.flights.addFlight.useMutation({
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
    <div className="flex flex-1 flex-col gap-3 p-3">
      <LoadingCard className="min-h-[400px] overflow-visible bg-base-100 shadow-lg">
        <Card.Body>
          <Card.Title className="mb-5 justify-center text-2xl">
            Add a Flight
          </Card.Title>
          <Form
            className="w-full"
            methods={methods}
            onFormSubmit={values => mutate(values)}
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap justify-around gap-8">
                <AirportInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ id, name }) => `${id} - ${name}`}
                  inputRef={firstFieldRef}
                  isRequired
                  labelText="Departure Airport"
                  menuClassName="w-full"
                  name="departureAirportId"
                />
                <AirportInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ id, name }) => `${id} - ${name}`}
                  isRequired
                  labelText="Arrival Airport"
                  menuClassName="w-full"
                  name="arrivalAirportId"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-8">
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
              </div>
              <Divider />
              <div className="flex flex-wrap justify-around gap-8">
                <AirlineInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ iata, icao, name }) =>
                    `${iata}/${icao} - ${name}`
                  }
                  labelText="Airline"
                  menuClassName="w-full"
                  name="airlineId"
                />
                <AircraftTypeInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ iata, icao, name }) =>
                    `${iata}/${icao} - ${name}`
                  }
                  labelText="Aircraft Type"
                  menuClassName="w-full"
                  name="aircraftTypeId"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-8">
                <FormControl
                  className="w-[200px]"
                  labelText="Flight Number"
                  name="flightNumber"
                  transform={integerInputTransformer}
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
              </div>
              <Divider />
              <div className="flex flex-wrap justify-between gap-12">
                <FormRadio
                  className="w-[400px] min-w-[250px]"
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
                <div className="flex min-w-[250px] max-w-[400px] flex-1 flex-col gap-4">
                  <FormControl
                    className="w-[400px] min-w-[250px]"
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
                </div>
                <FormRadio
                  className="w-[400px] min-w-[250px]"
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
              </div>
              <Divider />
              <div className="mb-8 flex flex-wrap gap-8">
                <FormControl
                  className="min-w-[250px] flex-1"
                  labelText="Comments"
                  name="comments"
                />
                <FormControl
                  className="min-w-[250px] flex-1"
                  labelText="Tracking Link"
                  name="trackingLink"
                />
              </div>
              <Button loading={isLoading} type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </LoadingCard>
    </div>
  );
};
