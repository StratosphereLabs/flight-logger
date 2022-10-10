import { useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { useAirportsSearchQuery } from '../../common/hooks';

export const DepartureAirportInput = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = useAirportsSearchQuery(query.trim());
  return (
    <TypeaheadInput
      label="Departure Airport"
      name="departureAirportId"
      getMenuItem={({ id, name }) => <a>{`${id} - ${name}`}</a>}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
