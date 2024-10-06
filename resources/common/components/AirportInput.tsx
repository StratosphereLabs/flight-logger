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
  const { data } = trpc.airports.searchAirports.useQuery(
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
      getItemText={({ id, name }) => `${id} - ${name}`}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
