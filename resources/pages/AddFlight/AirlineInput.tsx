import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TypeaheadInput } from '../../common/components';
import { useAirlinesSearchQuery } from '../../common/hooks';

export const AirlineInput = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = useAirlinesSearchQuery(query.trim());
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
