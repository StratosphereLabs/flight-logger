import { zodResolver } from '@hookform/resolvers/zod';
import { add, isBefore } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Form,
  FormControl,
  FormRadio,
  integerInputTransformer,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';
import { type AddFlightRequest, addFlightSchema } from '../../../app/schemas';
import {
  AircraftTypeInput,
  AirframeInput,
  AirlineInput,
  AirportInput,
} from '../../common/components';
import {
  useProtectedPage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import { trpc } from '../../utils/trpc';
import { addFlightDefaultValues } from './constants';

export const AddFlight = (): JSX.Element => {
  const utils = trpc.useUtils();
  useProtectedPage();
  const methods = useForm<AddFlightRequest>({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: addFlightDefaultValues,
    resolver: zodResolver(addFlightSchema),
  });
  const [departureDate, airframe] = useWatch<
    AddFlightRequest,
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
  useEffect(() => {
    if (typeof airframe?.operator === 'object') {
      methods.setValue('airline', airframe.operator);
    }
  }, [airframe, methods]);
  const handleSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const { mutate, isLoading } = trpc.flights.addFlight.useMutation({
    onSuccess: () => {
      handleSuccess('Flight Added!');
      methods.reset();
      setTimeout(() => {
        methods.setFocus('departureAirport');
      }, 100);
      void utils.users.invalidate();
      void utils.statistics.getCounts.invalidate();
      void utils.flights.getFollowingFlights.invalidate();
    },
    onError,
  });
  useEffect(() => {
    setTimeout(() => {
      methods.setFocus('departureAirport');
    }, 100);
  }, [methods]);
  return (
    <div className="mt-16 flex flex-1 flex-col p-2 sm:p-3">
      <article className="prose self-center">
        <h2>Add a Flight</h2>
      </article>
      <Form
        className="w-full"
        methods={methods}
        onFormSubmit={values => {
          mutate(values);
        }}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap justify-around gap-8">
            <AirportInput
              bordered
              className="w-[400px] min-w-[250px]"
              getBadgeText={({ id, name }) => `${id} - ${name}`}
              inputClassName="bg-base-100"
              isRequired
              labelText="Departure Airport"
              menuClassName="w-full"
              name="departureAirport"
            />
            <AirportInput
              bordered
              className="w-[400px] min-w-[250px]"
              getBadgeText={({ id, name }) => `${id} - ${name}`}
              inputClassName="bg-base-100"
              isRequired
              labelText="Arrival Airport"
              menuClassName="w-full"
              name="arrivalAirport"
            />
          </div>
          <div className="flex flex-wrap justify-between gap-8">
            <FormControl
              bordered
              className="w-[200px]"
              inputClassName="bg-base-100"
              isRequired
              labelText="Departure Date"
              name="outDateISO"
              type="date"
            />
            <FormControl
              bordered
              className="w-[200px]"
              inputClassName="bg-base-100"
              isRequired
              labelText="Departure Time (Local)"
              name="outTimeValue"
              transform={nullEmptyStringTransformer}
              type="time"
            />
            <FormControl
              bordered
              className="w-[200px]"
              inputClassName="bg-base-100"
              isRequired
              labelText="Arrival Time (Local)"
              name="inTimeValue"
              type="time"
            />
          </div>
          <div className="divider my-2" />
          {shouldShowRegField ? (
            <div className="flex flex-wrap justify-center">
              <AirframeInput
                bordered
                className="w-[400px] min-w-[250px]"
                inputClassName="bg-base-100"
                labelText="Registration"
                menuClassName="w-full"
                name="airframe"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap justify-between gap-8">
            <AirlineInput
              bordered
              className="w-[400px] min-w-[250px]"
              getBadgeText={({ iata, icao, name }) =>
                `${iata !== null ? `${iata}/` : ''}${icao} - ${name}`
              }
              inputClassName="bg-base-100"
              labelText="Airline"
              menuClassName="w-full"
              name="airline"
            />
            <FormControl
              bordered
              className="w-[200px]"
              labelText="Flight Number"
              inputClassName="bg-base-100"
              name="flightNumber"
              transform={integerInputTransformer}
            />
            <AircraftTypeInput
              bordered
              className="w-[400px] min-w-[250px]"
              getBadgeText={({ iata, icao, name }) =>
                `${iata}/${icao} - ${name}`
              }
              inputClassName="bg-base-100"
              labelText="Aircraft Type"
              menuClassName="w-full"
              name="aircraftType"
            />
          </div>
          <div className="divider my-2" />
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
                bordered
                className="w-[200px]"
                inputClassName="bg-base-100"
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
          <div className="divider my-2" />
          <div className="mb-8 flex flex-wrap gap-8">
            <FormControl
              bordered
              className="min-w-[250px] flex-1"
              inputClassName="bg-base-100"
              labelText="Comments"
              name="comments"
            />
            <FormControl
              bordered
              className="min-w-[250px] flex-1"
              inputClassName="bg-base-100"
              labelText="Tracking Link"
              name="trackingLink"
            />
          </div>
          <div className="text-center">
            <Button
              className="w-full max-w-md"
              color="primary"
              loading={isLoading}
              type="submit"
            >
              Submit
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
