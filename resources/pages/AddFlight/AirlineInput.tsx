import { useState } from 'react';
import { InputProps } from 'react-daisyui';
import { TypeaheadInput } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirlineInputProps extends InputProps {
  className?: string;
}

export const AirlineInput = ({
  className,
  ...props
}: AirlineInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error } = trpc.airlines.searchAirlines.useQuery(
    {
      query,
    },
    {
      enabled: query.length > 0,
    },
  );
  useTRPCErrorHandler(error);
  return (
    <TypeaheadInput
      className={className}
      labelText="Airline"
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      name="airlineId"
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
