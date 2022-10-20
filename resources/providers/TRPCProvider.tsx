import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { ReactNode } from 'react';
import { TRPC_API_URL } from '../common/constants';
import { trpc } from '../utils/trpc';
import { useAppContext } from './AppProvider';

export interface TRPCProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const TRPCProvider = ({ children }: TRPCProviderProps): JSX.Element => {
  const { token } = useAppContext();
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: TRPC_API_URL,
        headers: {
          Authorization: token !== null ? `Bearer ${token}` : undefined,
        },
      }),
    ],
  });
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
