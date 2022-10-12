import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export type UseDebouncedStateValue = string | number | boolean | null;

export const useDebouncedState = <Value extends UseDebouncedStateValue>(
  value: Value,
  delay: number,
): [Value, Dispatch<SetStateAction<Value>>, Value, boolean] => {
  const [currentValue, setCurrentValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(currentValue);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [currentValue, delay]);
  /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */
  const isDebouncing = !!currentValue && currentValue !== debouncedValue;
  return [currentValue, setCurrentValue, debouncedValue, isDebouncing];
};
