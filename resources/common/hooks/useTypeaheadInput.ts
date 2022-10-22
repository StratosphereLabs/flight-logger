import {
  ChangeEvent,
  ChangeEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDebouncedState } from './useDebouncedValue';

export interface UseTypeaheadInputOptions<DataItem> {
  debounceTime?: number;
  getItemText: (data: DataItem) => string;
  isFetching?: boolean;
  onDebouncedChange?: (value: string) => void;
  onItemSelect?: (item: DataItem | null) => void;
  options?: DataItem[];
}

export interface UseTypeaheadInputResult<DataItem> {
  handleChange: ChangeEventHandler<HTMLInputElement>;
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
  isLoading: boolean;
  item: DataItem | null;
  setSelectedItem: (item: DataItem | null) => void;
  value: string;
}

export const useTypeaheadInput = <DataItem extends Record<string, unknown>>({
  debounceTime,
  getItemText,
  isFetching,
  onDebouncedChange,
  onItemSelect,
  options,
}: UseTypeaheadInputOptions<DataItem>): UseTypeaheadInputResult<DataItem> => {
  const [query, setQuery, debouncedQuery, isDebouncing] =
    useDebouncedState<string>('', debounceTime ?? 400);
  const [item, setItem] = useState<DataItem | null>(null);
  const [itemText, setItemText] = useState('');
  const setSelectedItem = useCallback(
    (item: DataItem | null): void => {
      setQuery('');
      setItem(item);
      setItemText(item !== null ? getItemText(item) : '');
      onItemSelect?.(item);
    },
    [getItemText],
  );
  const handleChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setSelectedItem(null);
      setQuery(value);
    },
    [setSelectedItem],
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
  const isLoading = (isDebouncing || isFetching) ?? false;
  const formattedQuery = debouncedQuery.trim();
  useEffect(() => {
    onDebouncedChange?.(formattedQuery);
  }, [formattedQuery]);
  return {
    handleChange,
    handleKeyDown,
    isLoading,
    item,
    setSelectedItem,
    value: itemText !== '' ? itemText : query,
  };
};
