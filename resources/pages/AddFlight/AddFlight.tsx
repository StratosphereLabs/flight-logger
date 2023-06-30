import { zodResolver } from '@hookform/resolvers/zod';
import { add, isBefore } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  CardBody,
  CardTitle,
  Form,
  FormControl,
  FormRadio,
  LoadingCard,
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
  const utils = trpc.useContext();
  useProtectedPage();
  const methods = useForm<AddFlightRequest>({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: addFlightDefaultValues,
    resolver: zodResolver(addFlightSchema),
  });
  const [departureDate, airframe] = methods.watch(['outDateISO', 'airframe']);
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
  }, [airframe]);
  const handleSuccess = useSuccessResponseHandler();
  const { error, mutate, isLoading } = trpc.flights.addFlight.useMutation({
    onSuccess: async () => {
      handleSuccess('Flight Added!');
      methods.reset();
      setTimeout(() => {
        methods.setFocus('departureAirport');
      }, 100);
      await utils.users.invalidate();
    },
  });
  useTRPCErrorHandler(error);
  useEffect(() => {
    setTimeout(() => {
      methods.setFocus('departureAirport');
    }, 100);
  }, []);
  return (
    <div className="flex flex-1 flex-col overflow-y-scroll p-2 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:p-3 sm:scrollbar">
      <LoadingCard className="bg-base-100 shadow-md">
        <CardBody>
          <CardTitle className="mb-5 justify-center text-2xl">
            Add a Flight
          </CardTitle>
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
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ id, name }) => `${id} - ${name}`}
                  inputClassName="bg-base-200"
                  isRequired
                  labelText="Departure Airport"
                  menuClassName="w-full"
                  name="departureAirport"
                />
                <AirportInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ id, name }) => `${id} - ${name}`}
                  inputClassName="bg-base-200"
                  isRequired
                  labelText="Arrival Airport"
                  menuClassName="w-full"
                  name="arrivalAirport"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-8">
                <FormControl
                  className="w-[200px]"
                  inputClassName="bg-base-200"
                  isRequired
                  labelText="Departure Date"
                  name="outDateISO"
                  type="date"
                />
                <FormControl
                  className="w-[200px]"
                  inputClassName="bg-base-200"
                  isRequired
                  labelText="Departure Time (Local)"
                  name="outTimeValue"
                  transform={nullEmptyStringTransformer}
                  type="time"
                />
                <FormControl
                  className="w-[200px]"
                  inputClassName="bg-base-200"
                  isRequired
                  labelText="Arrival Time (Local)"
                  name="inTimeValue"
                  type="time"
                />
              </div>
              <div className="divider" />
              {shouldShowRegField ? (
                <div className="flex flex-wrap justify-center">
                  <AirframeInput
                    className="w-[400px] min-w-[250px]"
                    inputClassName="bg-base-200"
                    labelText="Registration"
                    menuClassName="w-full"
                    name="airframe"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap justify-between gap-8">
                <AirlineInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ iata, icao, name }) =>
                    `${iata}/${icao} - ${name}`
                  }
                  inputClassName="bg-base-200"
                  labelText="Airline"
                  menuClassName="w-full"
                  name="airline"
                />
                <FormControl
                  className="w-[200px]"
                  labelText="Flight Number"
                  inputClassName="bg-base-200"
                  name="flightNumber"
                  transform={integerInputTransformer}
                />
                <AircraftTypeInput
                  className="w-[400px] min-w-[250px]"
                  getBadgeText={({ iata, icao, name }) =>
                    `${iata}/${icao} - ${name}`
                  }
                  inputClassName="bg-base-200"
                  labelText="Aircraft Type"
                  menuClassName="w-full"
                  name="aircraftType"
                />
              </div>
              <div className="divider" />
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
                    className="w-[200px]"
                    inputClassName="bg-base-200"
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
              <div className="divider" />
              <div className="mb-8 flex flex-wrap gap-8">
                <FormControl
                  className="min-w-[250px] flex-1"
                  inputClassName="bg-base-200"
                  labelText="Comments"
                  name="comments"
                />
                <FormControl
                  className="min-w-[250px] flex-1"
                  inputClassName="bg-base-200"
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
        </CardBody>
      </LoadingCard>
    </div>
  );
};
