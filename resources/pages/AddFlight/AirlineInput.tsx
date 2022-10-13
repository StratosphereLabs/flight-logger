import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TypeaheadInput } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const AirlineInput = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = trpc.airlines.searchAirlines.useQuery(
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
      labelText="Airline"
      name="airlineId"
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      onItemSelect={item => setValue('airlineId', item?.id ?? '')}
      options={data}
    />
  );
};
