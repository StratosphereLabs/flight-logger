import { ForwardedRef, useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { useAirportsSearchQuery } from '../../common/hooks';

export interface DepartureAirportInputProps {
  innerRef?: ForwardedRef<HTMLInputElement>;
}

export const DepartureAirportInput = ({
  innerRef,
}: DepartureAirportInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = useAirportsSearchQuery(query.trim());
  return (
    <TypeaheadInput
      innerRef={innerRef}
      label="Departure Airport"
      name="departureAirportId"
      getMenuItem={({ id, name }) => <a>{`${id} - ${name}`}</a>}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
