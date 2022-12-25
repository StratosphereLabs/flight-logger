import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef } from 'react';
import { Button, Card, Divider } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { addItineraryFlightSchema } from '../../../app/schemas';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
  Form,
  FormControl,
  FormRadio,
} from '../../common/components';
import {
  nullEmptyStringTransformer,
  numberInputTransformer,
} from '../../common/transformers';
import { itineraryBuilderDefaultValues } from './constants';

export const ItineraryBuilderCard = forwardRef<HTMLDivElement>(
  (_, ref): JSX.Element => {
    const methods = useForm({
      mode: 'onBlur',
      shouldUseNativeValidation: false,
      defaultValues: itineraryBuilderDefaultValues,
      resolver: zodResolver(addItineraryFlightSchema),
    });
    return (
      <Card className="bg-base-200 text-center" ref={ref}>
        <Card.Body className="items-center">
          <Card.Title className="text-2xl mb-5">Create Itinerary</Card.Title>
          <Form
            className="w-full"
            methods={methods}
            onFormSubmit={values => {
              console.log(values);
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-8">
                <div className="flex-1 flex justify-center">
                  <AirportInput
                    className="max-w-sm"
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
                <div>
                  <FormControl
                    className="w-[120px]"
                    labelText="Flight Number"
                    name="flightNumber"
                    onWheel={e => (e.target as HTMLInputElement).blur?.()}
                    transform={numberInputTransformer}
                    type="number"
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
              </div>
              <Button type="submit">Add Flight</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    );
  },
);
