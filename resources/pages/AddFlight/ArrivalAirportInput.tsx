import { useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { useAirportsSearchQuery } from '../../common/hooks';

export const ArrivalAirportInput = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = useAirportsSearchQuery(query.trim());
  return (
    <TypeaheadInput
      label="Arrival Airport"
      name="arrivalAirportId"
      getMenuItem={({ id, name }) => <a>{`${id} - ${name}`}</a>}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
