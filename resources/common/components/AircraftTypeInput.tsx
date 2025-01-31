import type { AircraftType } from '@prisma/client';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';

import { trpc } from '../../utils/trpc';
import { useTRPCErrorHandler } from '../hooks';

export interface AircraftTypeInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<AircraftType, Values>,
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
      getItemText={({ iata, icao, name }) => (
        <div className="flex items-center gap-2 overflow-hidden text-sm">
          <span className="font-mono font-bold">
            {iata !== null ? `${iata}/` : ''}
            {icao}
          </span>
          <span className="flex-1 truncate">{name}</span>
        </div>
      )}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
