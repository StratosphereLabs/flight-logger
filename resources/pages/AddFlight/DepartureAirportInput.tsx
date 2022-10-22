import { useState } from 'react';
import { InputProps } from 'react-daisyui';
import { TypeaheadInput } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface DepartureAirportInputProps {
  inputProps?: InputProps & Record<string, unknown>;
  isRequired?: boolean;
}

export const DepartureAirportInput = ({
  inputProps,
  isRequired,
}: DepartureAirportInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error, isFetching } = trpc.airports.searchAirports.useQuery(
    {
      query,
    },
    {
      enabled: query.length > 0,
    },
  );
  useTRPCErrorHandler(error?.data);
  return (
    <TypeaheadInput
      inputProps={inputProps}
      isRequired={isRequired}
      labelText="Departure Airport"
      name="departureAirportId"
      getItemText={({ id, name }) => `${id} - ${name}`}
      getItemValue={({ id }) => id}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
