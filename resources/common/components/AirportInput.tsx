import { type Airport } from '@prisma/client';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';

import { trpc } from '../../utils/trpc';
import { useTRPCErrorHandler } from '../hooks';

export interface AirportInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<Airport, Values>,
    'dropdownInputClassName' | 'getItemText' | 'onDebouncedChange' | 'options'
  > {}

export const AirportInput = <Values extends FieldValues>(
  props: AirportInputProps<Values>,
): JSX.Element => {
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data, isFetching } = trpc.airports.searchAirports.useQuery(
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
      getItemText={({ iata, id, name }) => (
        <div className="flex items-center gap-2 overflow-hidden text-sm">
          <span className="font-mono font-bold">
            {iata !== null ? `${iata}/` : ''}
            {id}
          </span>
          <span className="flex-1 truncate">{name}</span>
        </div>
      )}
      isLoading={isFetching}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
