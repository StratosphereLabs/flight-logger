import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { type ReactNode } from 'react';
import { TRPC_API_URL } from '../common/constants';
import { useAuthStore } from '../stores';
import { trpc } from '../utils/trpc';

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
  const { token } = useAuthStore();
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
