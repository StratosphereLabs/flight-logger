import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { TypeaheadSelect, TypeaheadSelectProps } from 'stratosphere-ui';
import { AirframesRouterOutput } from '../../../app/routes/airframes';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirframeInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<
      AirframesRouterOutput['searchAirframes'][number],
      Values
    >,
    'getItemText' | 'onDebouncedChange' | 'options'
  > {}

export const AirframeInput = <Values extends FieldValues>(
  props: AirframeInputProps<Values>,
): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error } = trpc.airframes.searchAirframes.useQuery(
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
      getItemText={({ registration, operator }) =>
        `${registration}${operator !== null ? ` (${operator.name})` : ''}`
      }
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};