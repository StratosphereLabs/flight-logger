import classNames from 'classnames';
import { forwardRef, HTMLProps, RefObject } from 'react';
import { Button, Card, Divider } from 'react-daisyui';
import { FormControl, FormRadio } from 'stratosphere-ui';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
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
      className={classNames('bg-base-200 text-center shadow-xl', className)}
      ref={ref}
      {...props}
    >
      <Card.Body className="items-center">
        <Card.Title className="mb-5 text-2xl">Create Itinerary</Card.Title>
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-wrap justify-around gap-8">
            <AirportInput
              className="min-w-[250px] max-w-[400px]"
              inputRef={firstFieldRef}
              isRequired
              labelText="Departure Airport"
              name="departureAirportId"
            />
            <AirportInput
              className="min-w-[250px] max-w-[400px]"
              isRequired
              labelText="Arrival Airport"
              name="arrivalAirportId"
            />
          </div>
          <div className="flex flex-wrap justify-between gap-8">
            <FormControl
              className="min-w-[200px] max-w-[200px]"
              isRequired
              labelText="Departure Date"
              name="outDate"
              type="date"
            />
            <FormControl
              className="min-w-[200px] max-w-[200px]"
              isRequired
              labelText="Departure Time (Local)"
              name="outTime"
              transform={nullEmptyStringTransformer}
              type="time"
            />
            <FormControl
              className="min-w-[200px] max-w-[200px]"
              isRequired
              labelText="Arrival Time (Local)"
              name="inTime"
              type="time"
            />
          </div>
          <Divider />
          <div className="flex flex-wrap justify-between gap-8">
            <AirlineInput
              className="min-w-[250px] max-w-[400px]"
              labelText="Airline"
              name="airlineId"
            />
            <FormControl
              className="min-w-[150px] max-w-[150px]"
              labelText="Flight Number"
              name="flightNumber"
              onWheel={e => (e.target as HTMLInputElement).blur?.()}
              transform={numberInputTransformer}
              type="number"
            />
            <AircraftTypeInput
              className="min-w-[250px] max-w-[400px]"
              labelText="Aircraft Type"
              name="aircraftTypeId"
            />
            <FormRadio
              className="min-w-[250px] max-w-[400px]"
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
          </div>
          <div className="text-center">
            <Button className="w-full max-w-md" type="submit">
              Add Flight
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  ),
);
