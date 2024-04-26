import { useMemo } from 'react';

export const useCurrentDate = (): Date => useMemo(() => new Date(), []);
