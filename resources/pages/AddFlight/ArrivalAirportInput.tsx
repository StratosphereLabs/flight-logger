import { useState } from 'react';
import { InputProps } from 'react-daisyui';
import { TypeaheadInput } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface ArrivalAirportInputProps extends InputProps {
  className?: string;
  isRequired?: boolean;
}

export const ArrivalAirportInput = ({
  className,
  isRequired,
  ...props
}: ArrivalAirportInputProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const { data, error, isFetching } = trpc.airports.searchAirports.useQuery(
    {
      query,
    },
    {
      enabled: query.length > 0,
    },
  );
  useTRPCErrorHandler(error);
  return (
    <TypeaheadInput
      className={className}
      isRequired={isRequired}
      labelText="Arrival Airport"
      getItemText={({ id, name }) => `${id} - ${name}`}
      getItemValue={({ id }) => id}
      isFetching={isFetching}
      name="arrivalAirportId"
      onDebouncedChange={setQuery}
      options={data ?? []}
      {...props}
    />
  );
};
