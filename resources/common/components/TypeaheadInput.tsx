import { useCallback, useEffect } from 'react';
import { Menu } from 'react-daisyui';
import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { useTypeaheadInput, UseTypeaheadInputOptions } from '../hooks';
import { FormControl, FormControlProps } from './FormControl';

export interface TypeaheadInputProps<
  DataItem,
  Values extends FieldValues,
  TOutput,
> extends UseTypeaheadInputOptions<DataItem>,
    FormControlProps<Values, TOutput> {
  getItemValue: (data: DataItem) => string;
  getMenuItem?: (data: DataItem) => JSX.Element | null;
}

export const TypeaheadInput = <
  DataItem extends Record<string, unknown>,
  Values extends FieldValues,
  TOutput,
>({
  debounceTime,
  getItemText,
  getItemValue,
  getMenuItem,
  inputProps,
  isFetching,
  onDebouncedChange,
  options,
  ...props
}: TypeaheadInputProps<DataItem, Values, TOutput>): JSX.Element => {
  const { setValue } = useFormContext();
  const { field } = useController(props);
  const onItemSelect = useCallback((item: DataItem | null) => {
    const itemValue = item !== null ? getItemValue(item) : '';
    setValue<string>(props.name, itemValue, {
      shouldValidate: item !== null,
    });
  }, []);
  const {
    handleChange,
    handleKeyDown,
    isLoading,
    item,
    setSelectedItem,
    value,
  } = useTypeaheadInput({
    debounceTime,
    getItemText,
    isFetching,
    onDebouncedChange,
    onItemSelect,
    options,
  });
  useEffect(() => {
    if (field.value.length === 0) setSelectedItem(null);
  }, [field.value]);
  return (
    <FormControl
      inputProps={{
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        value,
        ...inputProps,
      }}
      menuContent={
        <Menu className="rounded-lg bg-base-300">
          {isLoading && (
            <Menu.Item disabled>
              <p>Loading...</p>
            </Menu.Item>
          )}
          {!isLoading && options?.length === 0 && (
            <Menu.Item disabled>
              <p>No Results</p>
            </Menu.Item>
          )}
          {!isLoading &&
            item === null &&
            options !== undefined &&
            options.length > 0 &&
            options.map((item, index) => (
              <Menu.Item key={index}>
                <a onClick={() => setSelectedItem(item)}>
                  {getMenuItem !== undefined
                    ? getMenuItem(item)
                    : getItemText(item)}
                </a>
              </Menu.Item>
            ))}
        </Menu>
      }
      {...props}
    />
  );
};
