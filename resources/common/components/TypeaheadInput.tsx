import { Combobox } from '@headlessui/react';
import classNames from 'classnames';
import { useCallback } from 'react';
import { Input, InputProps } from 'react-daisyui';
import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { useTypeaheadInput, UseTypeaheadInputOptions } from '../hooks';
import { FormFieldProps, GenericDataType } from '../types';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';

export interface TypeaheadInputProps<
  DataItem extends GenericDataType,
  Values extends FieldValues,
> extends UseTypeaheadInputOptions,
    FormFieldProps<Values>,
    Omit<InputProps, 'name'> {
  getItemText: (data: DataItem) => string;
  getItemValue: (data: DataItem) => string;
  options?: DataItem[];
}

export const TypeaheadInput = <
  DataItem extends GenericDataType,
  Values extends FieldValues,
>({
  controllerProps,
  debounceTime,
  getItemText,
  getItemValue,
  isFetching,
  isRequired,
  labelText,
  name,
  onDebouncedChange,
  options,
  ...props
}: TypeaheadInputProps<DataItem, Values>): JSX.Element => {
  const { setValue } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({
    ...controllerProps,
    name,
  });
  const { isLoading, selectedItem, setQuery, setSelectedItem } =
    useTypeaheadInput<DataItem>({
      debounceTime,
      isFetching,
      onDebouncedChange,
    });
  const onSelectionChange = useCallback((item: DataItem | null) => {
    const itemValue = item !== null ? getItemValue(item) : '';
    setSelectedItem(item);
    setValue<string>(name, itemValue, {
      shouldValidate: item !== null,
    });
  }, []);
  return (
    <Combobox
      as="div"
      className="form-control w-full max-w-sm"
      name={name}
      onChange={onSelectionChange}
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
        {...props}
      />
      <div className="relative">
        <div className="absolute min-w-[200px] z-10 mt-[1px] w-full">
          <Combobox.Options className="menu rounded-lg bg-base-300">
            {isLoading ? (
              <Combobox.Option className="disabled" value={null}>
                <p>Loading...</p>
              </Combobox.Option>
            ) : null}
            {!isLoading && options?.length === 0 ? (
              <Combobox.Option className="disabled" value={null}>
                <p>No Results</p>
              </Combobox.Option>
            ) : null}
            {!isLoading &&
              options?.map(option => (
                <Combobox.Option
                  className={({ active, disabled }) =>
                    classNames(
                      active ? 'bg-primary text-white' : 'bg-ghost',
                      disabled && 'disabled',
                    )
                  }
                  key={option.id}
                  value={option}
                >
                  <p>{getItemText(option)}</p>
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </div>
      </div>
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </Combobox>
  );
};
