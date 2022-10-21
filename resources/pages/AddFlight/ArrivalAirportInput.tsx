import { useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const ArrivalAirportInput = (): JSX.Element => {
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
      labelText="Arrival Airport"
      name="arrivalAirportId"
      getItemText={({ id, name }) => `${id} - ${name}`}
      getItemValue={({ id }) => id}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
