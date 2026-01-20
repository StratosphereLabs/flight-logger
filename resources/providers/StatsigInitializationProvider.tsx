import { useStatsigUser } from '@statsig/react-bindings';
import { type ReactNode, useEffect } from 'react';

import { useLoggedInUserQuery } from '../common/hooks';

export interface StatsigInitializationProviderProps {
  children: ReactNode;
}

export const StatsigInitializationProvider = ({
  children,
}: StatsigInitializationProviderProps): JSX.Element => {
  const { data } = useLoggedInUserQuery();
  const { updateUserSync } = useStatsigUser();
  useEffect(() => {
    if (data !== undefined) {
      updateUserSync({
        userID: data.id.toString(),
        email: data.email,
      });
    }
  }, [data, updateUserSync]);
  return <>{children}</>;
};
