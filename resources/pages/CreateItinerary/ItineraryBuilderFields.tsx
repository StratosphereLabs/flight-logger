import classNames from 'classnames';
import { forwardRef, type HTMLProps } from 'react';
import {
  FormControl,
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
      <div className="divider my-2" />
      <div className="flex flex-wrap justify-between gap-8">
        <AirlineInput
          className="w-[400px] min-w-[250px]"
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
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
          getBadgeText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
          labelText="Aircraft Type"
          inputClassName="bg-base-200"
          menuClassName="w-full"
          name="aircraftType"
        />
      </div>
    </div>
  ),
);
