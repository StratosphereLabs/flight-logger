import { type Airline } from '@prisma/client';
import classNames from 'classnames';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { useIsDarkMode } from '../../stores';
import { trpc } from '../../utils/trpc';

export interface AirlineInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<Airline, Values>,
    'getItemText' | 'onDebouncedChange' | 'options'
  > {}

export const AirlineInput = <Values extends FieldValues>({
  dropdownInputClassName,
  ...props
}: AirlineInputProps<Values>): JSX.Element => {
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const isDarkMode = useIsDarkMode();
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
      getBadgeClassName={() =>
        classNames('badge-lg', !isDarkMode && 'badge-ghost bg-base-100')
      }
      getItemText={({ iata, icao, name, logo }) => (
        <div className="flex items-center gap-2 overflow-hidden text-sm">
          <div className="flex h-[20px] w-[64px] items-center justify-center lg:h-[24px] lg:w-[75px]">
            {logo !== null ? (
              <img
                alt={`${name} Logo`}
                className="max-h-[20px] max-w-[64px] lg:max-h-[24px] lg:max-w-[75px]"
                src={logo}
              />
            ) : null}
          </div>
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
