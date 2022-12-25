import { airline } from '@prisma/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import {
  TypeaheadSingleSelect,
  TypeaheadSingleSelectProps,
} from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirlineInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSingleSelectProps<airline, Values>,
    'getItemText' | 'getItemValue' | 'onDebouncedChange' | 'options'
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
    <TypeaheadSingleSelect
      getItemText={({ iata, icao, name }) => `${iata}/${icao} - ${name}`}
      getItemValue={({ id }) => id}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
