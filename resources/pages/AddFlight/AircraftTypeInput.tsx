import { useState } from 'react';
import { TypeaheadInput } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AircraftTypeInputProps {
  className?: string;
}

export const AircraftTypeInput = ({
  className,
}: AircraftTypeInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error, isFetching } =
    trpc.aircraftTypes.searchAircraft.useQuery(
      {
        query,
      },
      {
        enabled: query.length > 0,
      },
    );
  useTRPCErrorHandler(error);
  return (
    <TypeaheadInput
      className={className}
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
