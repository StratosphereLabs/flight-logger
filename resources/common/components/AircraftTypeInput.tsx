import type { aircraft_type } from '@prisma/client';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { useTRPCErrorHandler } from '../hooks';

export interface AircraftTypeInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<aircraft_type, Values>,
    'dropdownInputClassName' | 'getItemText' | 'onDebouncedChange' | 'options'
  > {}

export const AircraftTypeInput = <Values extends FieldValues>(
  props: AircraftTypeInputProps<Values>,
): JSX.Element => {
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data } = trpc.aircraftTypes.searchAircraft.useQuery(
    {
      query,
    },
    {
      enabled: query.length > 0,
      onError,
    },
  );
  return (
    <TypeaheadSelect
      dropdownInputClassName="bg-base-200"
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
