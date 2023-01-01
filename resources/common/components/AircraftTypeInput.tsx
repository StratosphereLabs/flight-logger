import { aircraft_type } from '@prisma/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { TypeaheadSelect, TypeaheadSelectProps } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../hooks';
import { trpc } from '../../utils/trpc';

export interface AircraftTypeInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<aircraft_type, Values>,
    'getItemText' | 'getItemValue' | 'onDebouncedChange' | 'options'
  > {}

export const AircraftTypeInput = <Values extends FieldValues>(
  props: AircraftTypeInputProps<Values>,
): JSX.Element => {
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
    <TypeaheadSelect
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
