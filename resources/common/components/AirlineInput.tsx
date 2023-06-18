import { type airline } from '@prisma/client';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirlineInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<airline, Values>,
    'getItemText' | 'onDebouncedChange' | 'options'
  > {}

export const AirlineInput = <Values extends FieldValues>(
  props: AirlineInputProps<Values>,
): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error } = trpc.airlines.searchAirlines.useQuery(
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
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
