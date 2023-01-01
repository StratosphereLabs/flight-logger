import { Combobox } from '@headlessui/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Input } from 'react-daisyui';
import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { TypeaheadDropdown } from './TypeaheadDropdown';
import { TypeaheadSelectProps } from './TypeaheadSelect';
import { FormError } from '../FormError';
import { FormLabel } from '../FormLabel';
import { useTypeaheadInput } from '../../hooks';
import { GenericDataType } from '../../types';

export interface TypeaheadSingleSelectProps<
  DataItem extends GenericDataType,
  Values extends FieldValues,
> extends Omit<TypeaheadSelectProps<DataItem, Values>, 'multi'> {}

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
  placeholder,
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
      className={classNames('form-control', 'w-full', className)}
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
        placeholder={placeholder}
        ref={inputRef}
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
