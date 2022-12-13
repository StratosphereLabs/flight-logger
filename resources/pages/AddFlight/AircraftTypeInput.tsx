import { useState } from 'react';
import { InputProps } from 'react-daisyui';
import { TypeaheadInput } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AircraftTypeInputProps extends InputProps {
  className?: string;
}

export const AircraftTypeInput = ({
  className,
  ...props
}: AircraftTypeInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error } = trpc.aircraftTypes.searchAircraft.useQuery(
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
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      name="aircraftTypeId"
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
