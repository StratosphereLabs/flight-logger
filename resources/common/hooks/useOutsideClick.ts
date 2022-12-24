import { RefObject, useEffect } from 'react';

export const useOutsideClick = (
  ref: RefObject<HTMLElement>,
  onClick: (event: DocumentEventMap['mousedown']) => void,
): void =>
  useEffect(() => {
    const handleClickOutside = (event: DocumentEventMap['mousedown']): void => {
      if (ref.current !== null && !ref.current.contains(event.target as Node)) {
        onClick(event);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
