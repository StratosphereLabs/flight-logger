import { useState } from 'react';
import { InputProps } from 'react-daisyui';
import { TypeaheadInput } from '../../common/components';
import { trpc } from '../../utils/trpc';

export interface DepartureAirportInputProps {
  inputProps?: InputProps & Record<string, unknown>;
}

export const DepartureAirportInput = ({
  inputProps,
}: DepartureAirportInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = trpc.airports.searchAirports.useQuery(
    {
      query,
    },
    {
      enabled: query.length > 0,
    },
  );
  return (
    <TypeaheadInput
      inputProps={inputProps}
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
