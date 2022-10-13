import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Menu } from 'react-daisyui';
import { FieldValues } from 'react-hook-form';
import { useDebouncedState } from '../hooks';
import { FormControl, FormControlProps } from './FormControl';

export interface TypeaheadInputProps<DataItem, Values extends FieldValues>
  extends FormControlProps<Values> {
  debounceTime?: number;
  getItemText: (data: DataItem) => string;
  getMenuItem?: (data: DataItem) => JSX.Element | null;
  isFetching?: boolean;
  onDebouncedChange?: (value: string) => void;
  onItemSelect: (data: DataItem | null) => void;
  options?: DataItem[];
}

export const TypeaheadInput = <
  DataItem extends Record<string, unknown>,
  Values extends FieldValues,
>({
  debounceTime,
  getItemText,
  getMenuItem,
  inputProps,
  isFetching,
  onDebouncedChange,
  onItemSelect,
  options,
  ...props
}: TypeaheadInputProps<DataItem, Values>): JSX.Element => {
  const [query, setQuery, debouncedQuery, isDebouncing] =
    useDebouncedState<string>('', debounceTime ?? 400);
  const [item, setItem] = useState<DataItem | null>(null);
  const [valueText, setValueText] = useState('');
  const setSelectedItem = useCallback(
    (item: DataItem | null): void => {
      const valueText = item !== null ? getItemText(item) : '';
      setItem(item);
      setValueText(valueText);
    },
    [getItemText],
  );
  const handleKeyDown = useCallback(
    ({ key }: KeyboardEvent<HTMLInputElement>) => {
      if (key === 'Tab') {
        const firstOption = options?.[0];
        if (firstOption !== undefined) setSelectedItem(firstOption);
      }
    },
    [options, setSelectedItem],
  );
  const isLoading = isDebouncing || isFetching;
  const formattedQuery = debouncedQuery.trim();
  useEffect(() => {
    onDebouncedChange?.(formattedQuery);
  }, [formattedQuery]);
  useEffect(() => {
    onItemSelect(item);
  }, [item]);
  return (
    <FormControl
      inputProps={{
        onChange: ({ target: { value } }) => {
          setSelectedItem(null);
          setQuery(value);
        },
        onKeyDown: handleKeyDown,
        value: valueText !== '' ? valueText : query,
        ...inputProps,
      }}
      menuContent={
        <Menu className="rounded-lg bg-base-300">
          {isLoading === true && (
            <Menu.Item disabled>
              <p>Loading...</p>
            </Menu.Item>
          )}
          {isLoading === false && options?.length === 0 && (
            <Menu.Item disabled>
              <p>No Results</p>
            </Menu.Item>
          )}
          {isLoading === false &&
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
