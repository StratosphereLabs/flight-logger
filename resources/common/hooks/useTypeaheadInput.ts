import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { GenericDataType } from '../types';
import { useDebouncedState } from './useDebouncedValue';

export interface UseTypeaheadInputOptions {
  debounceTime?: number;
  isFetching?: boolean;
  onDebouncedChange?: (value: string) => void;
}

export interface UseTypeaheadInputResult<DataItem> {
  isLoading: boolean;
  query: string;
  selectedItem: DataItem | null;
  setQuery: Dispatch<SetStateAction<string>>;
  setSelectedItem: Dispatch<SetStateAction<DataItem | null>>;
}

export const useTypeaheadInput = <DataItem extends GenericDataType>({
  debounceTime,
  isFetching,
  onDebouncedChange,
}: UseTypeaheadInputOptions): UseTypeaheadInputResult<DataItem> => {
  const [query, setQuery, debouncedQuery, isDebouncing] =
    useDebouncedState<string>('', debounceTime ?? 400);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const isLoading = (isDebouncing || isFetching) ?? false;
  const formattedQuery = debouncedQuery.trim();
  useEffect(() => {
    onDebouncedChange?.(formattedQuery);
  }, [formattedQuery]);
  return {
    isLoading,
    query,
    selectedItem,
    setQuery,
    setSelectedItem,
  };
};
