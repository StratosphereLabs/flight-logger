import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

import { type AppRouter } from '../../appRouter';

export const useStateWithSearchParam = <DataType>(
  defaultValue: DataType | (() => DataType),
  paramName: string,
  from: Parameters<typeof useSearch<AppRouter>>[0]['from'] &
    Parameters<typeof useNavigate<AppRouter>>[0],
): [DataType, Dispatch<SetStateAction<DataType>>] => {
  const search = useSearch<AppRouter>({ from });
  const navigate = useNavigate<AppRouter>(from);
  const [state, setState] = useState<DataType>(
    search[paramName] ?? defaultValue,
  );
  const setStateWithSearchParam = useCallback(
    (value: SetStateAction<DataType>) => {
      setState(oldValue => {
        const newValue =
          typeof value === 'function'
            ? (value as (prevState: DataType) => DataType)(oldValue)
            : value;
        void navigate({
          to: from,
          search: ((prev: Record<string, unknown>) => ({
            ...prev,
            [paramName]: newValue,
          })) as Parameters<
            ReturnType<typeof useNavigate<AppRouter>>
          >[0]['search'],
        });
        return newValue;
      });
    },
    [from, navigate, paramName],
  );
  return [state, setStateWithSearchParam];
};
