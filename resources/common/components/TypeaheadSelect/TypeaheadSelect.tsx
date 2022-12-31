import { RefObject } from 'react';
import { FieldValues } from 'react-hook-form';
import { TypeaheadMultiSelect } from './TypeaheadMultiSelect';
import { TypeaheadSingleSelect } from './TypeaheadSingleSelect';
import { UseTypeaheadInputOptions } from '../../hooks';
import { FormFieldProps, GenericDataType } from '../../types';

export interface TypeaheadSelectProps<
  DataItem extends GenericDataType,
  Values extends FieldValues,
> extends UseTypeaheadInputOptions<DataItem>,
    FormFieldProps<Values> {
  className?: string;
  getItemText: (data: DataItem) => string;
  getItemValue: (data: DataItem) => string;
  inputRef?: RefObject<HTMLInputElement>;
  multi?: true;
}

export const TypeaheadSelect = <
  DataItem extends GenericDataType,
  Values extends FieldValues,
>({
  multi,
  ...props
}: TypeaheadSelectProps<DataItem, Values>): JSX.Element => {
  const Component =
    multi === true ? TypeaheadMultiSelect : TypeaheadSingleSelect;
  return <Component {...props} />;
};
