import classNames from 'classnames';
import { forwardRef, HTMLProps, RefObject } from 'react';
import { Button, Card, Divider } from 'react-daisyui';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
  FormControl,
  FormRadio,
} from '../../common/components';
import {
  nullEmptyStringTransformer,
  numberInputTransformer,
} from '../../common/transformers';

export interface ItineraryBuilderCardProps
  extends Omit<HTMLProps<HTMLDivElement>, 'ref'> {
  firstFieldRef: RefObject<HTMLInputElement>;
  onReset: () => void;
}

export const ItineraryBuilderCard = forwardRef<
  HTMLDivElement,
  ItineraryBuilderCardProps
>(
  ({ className, firstFieldRef, onReset, ...props }, ref): JSX.Element => (
    <Card
      className={classNames('bg-base-200', 'text-center', className)}
      ref={ref}
      {...props}
    >
      <Card.Body className="items-center">
        <Card.Title className="text-2xl mb-5">Create Itinerary</Card.Title>
        <div className="flex flex-col gap-4 w-full">
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
      </Card.Body>
    </Card>
  ),
);
