import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';
import { type AirframesRouterOutput } from '../../../app/routes/airframes';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface AirframeInputProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<
      AirframesRouterOutput['searchAirframes'][number],
      Values
    >,
    'dropdownInputClassName' | 'getItemText' | 'onDebouncedChange' | 'options'
  > {}

export const AirframeInput = <Values extends FieldValues>(
  props: AirframeInputProps<Values>,
): JSX.Element => {
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data } = trpc.airframes.searchAirframes.useQuery(
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
      getItemText={({ registration, operator }) =>
        `${registration}${operator !== null ? ` (${operator.name})` : ''}`
      }
      onDebouncedChange={setQuery}
      options={
        data?.length === 0
          ? [
              {
                type: 'custom',
                id: query.toUpperCase(),
                icao24: '',
                registration: query.toUpperCase(),
                manufacturerCode: '',
                model: '',
                typeCode: '',
                serialNumber: '',
                lineNumber: '',
                icaoAircraftType: '',
                owner: '',
                testReg: '',
                registrationDate: null,
                registrationExprDate: null,
                builtDate: null,
                engines: '',
                aircraftTypeId: '',
                operatorId: '',
                aircraftType: null,
                operator: null,
              },
            ]
          : data
      }
      {...props}
    />
  );
};
