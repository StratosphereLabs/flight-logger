import { useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirlineInputProps {
  className?: string;
}

export const AirlineInput = ({ className }: AirlineInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error, isFetching } = trpc.airlines.searchAirlines.useQuery(
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
      name="airlineId"
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
