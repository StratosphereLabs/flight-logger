import { RefObject, useEffect, useRef } from 'react';

export const useFocusOnFirstField = (): RefObject<HTMLInputElement> => {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);
  return firstFieldRef;
};
