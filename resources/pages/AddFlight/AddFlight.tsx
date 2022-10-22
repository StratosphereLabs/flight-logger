import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Divider } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { addFlightSchema } from '../../../app/schemas';
import {
  Form,
  FormControl,
  FormRadio,
  LoadingCard,
} from '../../common/components';
import {
  useFocusOnFirstField,
  useProtectedPage,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../common/hooks';
import {
  nullEmptyStringTransformer,
  numberInputTransformer,
} from '../../common/transformers';
import { trpc } from '../../utils/trpc';
import { AircraftTypeInput } from './AircraftTypeInput';
import { AirlineInput } from './AirlineInput';
import { ArrivalAirportInput } from './ArrivalAirportInput';
import { addFlightDefaultValues } from './constants';
import { DepartureAirportInput } from './DepartureAirportInput';

export const AddFlight = (): JSX.Element => {
  useProtectedPage();
  const firstFieldRef = useFocusOnFirstField();
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: addFlightDefaultValues,
    resolver: zodResolver(addFlightSchema),
  });
  const handleSuccess = useSuccessResponseHandler('Flight Added!');
  const { error, mutate, isLoading } = trpc.users.addFlight.useMutation({
    onSuccess: () => {
      handleSuccess();
      methods.reset();
    },
  });
  useTRPCErrorHandler(error?.data);
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
                <DepartureAirportInput
                  isRequired
                  inputProps={{ ref: firstFieldRef }}
                />
              </div>
              <div className="flex-1 flex justify-center">
                <ArrivalAirportInput isRequired />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'date',
                  }}
                  isRequired
                  labelText="Date"
                  name="outDate"
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'time',
                  }}
                  isRequired
                  labelText="Departure Time"
                  name="outTime"
                  transform={nullEmptyStringTransformer}
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'time',
                  }}
                  isRequired
                  labelText="Arrival Time"
                  name="inTime"
                />
              </div>
            </div>
            <Divider />
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <AirlineInput />
              </div>
              <div className="flex-1 flex justify-center">
                <AircraftTypeInput />
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 flex justify-center">
                <FormControl
                  inputProps={{
                    type: 'number',
                    onWheel: e => (e.target as HTMLInputElement).blur?.(),
                  }}
                  labelText="Flight Number"
                  name="flightNumber"
                  transform={numberInputTransformer}
                />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Callsign" name="callsign" />
              </div>
              <div className="flex-1 flex justify-center">
                <FormControl labelText="Registration" name="tailNumber" />
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
                  inputProps={{
                    className: 'mb-5',
                  }}
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
