import { airport } from '@prisma/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { TypeaheadSelect, TypeaheadSelectProps } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../hooks';
import { trpc } from '../../utils/trpc';

export interface AirportInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<airport, Values>,
    'getItemText' | 'getItemValue' | 'onDebouncedChange' | 'options'
  > {}

export const AirportInput = <Values extends FieldValues>(
  props: AirportInputProps<Values>,
): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error } = trpc.airports.searchAirports.useQuery(
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
      getItemText={({ id, name }) => `${id} - ${name}`}
      getItemValue={({ id }) => id}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
