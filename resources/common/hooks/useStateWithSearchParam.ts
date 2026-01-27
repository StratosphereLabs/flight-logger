import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

import { type AppRouter, type SearchParams } from '../../router';

export const useStateWithSearchParam = <S>(
  defaultValue: S | (() => S),
  paramName: keyof SearchParams,
  from: Parameters<typeof useSearch<AppRouter>>[0]['from'] &
    Parameters<typeof useNavigate<AppRouter>>[0],
): [S, Dispatch<SetStateAction<S>>] => {
  const search = useSearch({ strict: false });
  const navigate = useNavigate(from);
  const searchValue = search[paramName] as S;
  const [state, setState] = useState<S>(searchValue ?? defaultValue);
  const setStateWithSearchParam = useCallback(
    (value: SetStateAction<S>) => {
      setState(oldValue => {
        const newValue =
          typeof value === 'function'
            ? (value as (prevState: S) => S)(oldValue)
            : value;
        void navigate({
          search: ((prev: Record<string, unknown>) => ({
            ...prev,
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            [paramName]: !newValue ? undefined : newValue,
          })) as Parameters<ReturnType<typeof useNavigate>>[0]['search'],
          replace: true,
        });
        return newValue;
      });
    },
    [navigate, paramName],
  );
  return [state, setStateWithSearchParam];
};
