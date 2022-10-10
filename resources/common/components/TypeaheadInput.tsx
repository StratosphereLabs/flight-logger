import { useEffect } from 'react';
import { Menu } from 'react-daisyui';
import { useDebouncedState } from '../hooks';
import { FormControl, FormControlProps } from './FormControl';

export interface TypeaheadInputProps<DataItem> extends FormControlProps {
  getMenuItem: (data: DataItem) => JSX.Element | null;
  isFetching?: boolean;
  onDebouncedChange?: (value: string) => void;
  options?: DataItem[];
}

export const TypeaheadInput = <DataItem extends Record<string, unknown>>({
  getMenuItem,
  isFetching,
  onDebouncedChange,
  options,
  ...props
}: TypeaheadInputProps<DataItem>): JSX.Element => {
  const [query, setQuery, debouncedQuery, isDebouncing] =
    useDebouncedState<string>('', 400);
  const isLoading = isDebouncing || isFetching;
  const formattedQuery = debouncedQuery.trim();
  useEffect(() => {
    onDebouncedChange?.(formattedQuery);
  }, [formattedQuery]);
  return (
    <FormControl
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
            options !== undefined &&
            options.length > 0 &&
            options.map((item, index) => (
              <Menu.Item key={index}>{getMenuItem(item)}</Menu.Item>
            ))}
        </Menu>
      }
      onChange={({ target: { value } }) => setQuery(value)}
      value={query}
      {...props}
    />
  );
};
