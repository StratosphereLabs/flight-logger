import { useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { trpc } from '../../utils/trpc';

export const AircraftTypeInput = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = trpc.aircraftTypes.searchAircraft.useQuery(
    {
      query,
    },
    {
      enabled: query.length > 0,
    },
  );
  return (
    <TypeaheadInput
      labelText="Aircraft Type"
      name="aircraftTypeId"
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      options={data}
    />
  );
};
