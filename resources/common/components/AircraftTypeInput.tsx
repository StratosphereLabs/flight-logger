import { aircraft_type } from '@prisma/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { TypeaheadSingleSelect, TypeaheadSingleSelectProps } from '.';
import { useTRPCErrorHandler } from '../hooks';
import { trpc } from '../../utils/trpc';

export interface AircraftTypeInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSingleSelectProps<aircraft_type, Values>,
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
    <TypeaheadSingleSelect
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
