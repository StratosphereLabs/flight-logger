import { useState } from 'react';
import { InputProps } from 'react-daisyui';
import { useFormContext } from 'react-hook-form';
import { TypeaheadInput } from '../../common/components';
import { useAirportsSearchQuery } from '../../common/hooks';

export interface DepartureAirportInputProps {
  inputProps?: InputProps & Record<string, unknown>;
}

export const DepartureAirportInput = ({
  inputProps,
}: DepartureAirportInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = useAirportsSearchQuery(query.trim());
  const { setValue } = useFormContext();
  return (
    <TypeaheadInput
      inputProps={inputProps}
      labelText="Departure Airport"
      name="departureAirportId"
      getItemText={({ id, name }) => `${id} - ${name}`}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      onItemSelect={item => setValue('departureAirportId', item?.id ?? '')}
      options={data}
    />
  );
};
