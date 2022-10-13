import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
  const { setValue } = useFormContext();
  return (
    <TypeaheadInput
      labelText="Arrival Airport"
      name="arrivalAirportId"
      getItemText={({ id, name }) => `${id} - ${name}`}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      onItemSelect={item => setValue('arrivalAirportId', item?.id ?? '')}
      options={data}
    />
  );
};
