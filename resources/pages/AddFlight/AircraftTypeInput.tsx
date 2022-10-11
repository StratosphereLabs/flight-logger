import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { TypeaheadInput } from '../../common/components';
import { useAircraftTypesSearchQuery } from '../../common/hooks';

export const AircraftTypeInput = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, isFetching } = useAircraftTypesSearchQuery(query.trim());
  const { setValue } = useFormContext();
  return (
    <TypeaheadInput
      labelText="Aircraft Type"
      name="aircraftTypeId"
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      isFetching={isFetching}
      onDebouncedChange={setQuery}
      onItemSelect={item => setValue('aircraftTypeId', item?.id ?? '')}
      options={data}
    />
  );
};
