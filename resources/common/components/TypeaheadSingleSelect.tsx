import { Combobox } from '@headlessui/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Input, InputProps } from 'react-daisyui';
import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';
import { TypeaheadDropdown } from './TypeaheadDropdown';
import { useTypeaheadInput } from '../hooks';
import { GenericDataType, TypeaheadSelectProps } from '../types';

export interface TypeaheadSingleSelectProps<
  DataItem extends GenericDataType,
  Values extends FieldValues,
> extends TypeaheadSelectProps<DataItem, Values, HTMLInputElement>,
    Omit<InputProps, 'name'> {}

export const TypeaheadSingleSelect = <
  DataItem extends GenericDataType,
  Values extends FieldValues,
>({
  className,
  controllerProps,
  debounceTime,
  getItemText,
  getItemValue,
  inputRef,
  isRequired,
  labelText,
  name,
  onDebouncedChange,
  options,
  ...props
}: TypeaheadSingleSelectProps<DataItem, Values>): JSX.Element => {
  const { setValue } = useFormContext();
  const {
    field: { value, ...field },
    fieldState: { error },
  } = useController({
    ...controllerProps,
    name,
  });
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const { isLoading, setQuery } = useTypeaheadInput<DataItem>({
    debounceTime,
    onDebouncedChange,
    options,
  });
  useEffect(() => {
    const itemValue = selectedItem !== null ? getItemValue(selectedItem) : '';
    setValue<string>(name, itemValue, {
      shouldValidate: selectedItem !== null,
    });
  }, [selectedItem]);
  useEffect(() => {
    if (value === '') setSelectedItem(null);
  }, [value]);
  return (
    <Combobox
      as="div"
      className={classNames('form-control', 'w-full', 'max-w-sm', className)}
      name={name}
      nullable
      onChange={setSelectedItem}
      value={selectedItem}
    >
      {labelText !== undefined ? (
        <Combobox.Label as={FormLabel} isRequired={isRequired}>
          {labelText}
        </Combobox.Label>
      ) : null}
      <Combobox.Input
        {...field}
        as={Input}
        color={error === undefined ? 'ghost' : 'error'}
        displayValue={(item: DataItem | null) =>
          item !== null ? getItemText(item) : ''
        }
        onChange={({ target: { value } }) => setQuery(value)}
        ref={inputRef}
        {...props}
      />
      <TypeaheadDropdown
        isLoading={isLoading}
        getItemText={getItemText}
        getItemValue={getItemValue}
        options={options}
      />
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </Combobox>
  );
};
