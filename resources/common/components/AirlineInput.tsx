import { type airline } from '@prisma/client';
import classNames from 'classnames';
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

export const AirlineInput = <Values extends FieldValues>({
  dropdownInputClassName,
  ...props
}: AirlineInputProps<Values>): JSX.Element => {
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data } = trpc.airlines.searchAirlines.useQuery(
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
      dropdownInputClassName={classNames('bg-base-200', dropdownInputClassName)}
      getItemText={({ iata, icao, name }) =>
        `${iata !== null ? `${iata}/` : ''}${icao} - ${name}`
      }
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
