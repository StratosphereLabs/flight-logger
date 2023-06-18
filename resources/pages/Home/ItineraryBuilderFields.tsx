import classNames from 'classnames';
import { forwardRef, type HTMLProps } from 'react';
import {
  Button,
  FormControl,
  FormRadio,
  integerInputTransformer,
  nullEmptyStringTransformer,
} from 'stratosphere-ui';
import {
  AircraftTypeInput,
  AirlineInput,
  AirportInput,
} from '../../common/components';

export interface ItineraryBuilderCardProps extends HTMLProps<HTMLDivElement> {}

export const ItineraryBuilderFields = forwardRef<
  HTMLDivElement,
  ItineraryBuilderCardProps
>(
  ({ className, ...props }, ref): JSX.Element => (
    <div
      className={classNames('flex w-full flex-col gap-8', className)}
      ref={ref}
      {...props}
    >
      <div className="flex flex-wrap justify-around gap-8">
        <AirportInput
          className="w-[350px] min-w-[250px]"
          getBadgeText={({ id, name }) => `${id} - ${name}`}
          isRequired
          labelText="Departure Airport"
          menuClassName="w-full"
          name="departureAirport"
        />
        <AirportInput
          className="w-[350px] min-w-[250px]"
          getBadgeText={({ id, name }) => `${id} - ${name}`}
          isRequired
          labelText="Arrival Airport"
          menuClassName="w-full"
          name="arrivalAirport"
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
      <div className="divider" />
      <div className="flex flex-wrap justify-between gap-8">
        <AirlineInput
          className="w-[350px] min-w-[250px]"
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Airline"
          menuClassName="w-full"
          name="airline"
        />
        <FormControl
          className="w-[150px]"
          labelText="Flight Number"
          name="flightNumber"
          transform={integerInputTransformer}
        />
        <AircraftTypeInput
          className="w-[350px] min-w-[250px]"
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          menuClassName="w-full"
          name="aircraftType"
        />
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
      </div>
      <div className="text-center">
        <Button color="primary" className="w-full max-w-md" type="submit">
          Add Flight
        </Button>
      </div>
    </div>
  ),
);
