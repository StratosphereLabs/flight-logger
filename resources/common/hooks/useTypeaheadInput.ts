import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { GenericDataType } from '../types';
import { useDebouncedState } from './useDebouncedValue';

export interface UseTypeaheadInputOptions<DataItem> {
  debounceTime?: number;
  onDebouncedChange: (value: string) => void;
  options?: DataItem[];
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
  onDebouncedChange,
  options,
}: UseTypeaheadInputOptions<DataItem>): UseTypeaheadInputResult<DataItem> => {
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery, debouncedQuery] = useDebouncedState<string>(
    '',
    debounceTime ?? 400,
  );
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const currentQuery = useMemo(() => {
    const formattedQuery = query.trim();
    const formattedDebouncedQuery = debouncedQuery.trim();
    return formattedQuery === '' ? formattedQuery : formattedDebouncedQuery;
  }, [query, debouncedQuery]);
  useEffect(() => {
    onDebouncedChange?.(currentQuery);
  }, [currentQuery]);
  useEffect(() => {
    if (options !== undefined) setIsLoading(false);
  }, [options]);
  useEffect(() => {
    setIsLoading(query !== '');
  }, [query]);
  return {
    isLoading,
    query,
    selectedItem,
    setQuery,
    setSelectedItem,
  };
};
