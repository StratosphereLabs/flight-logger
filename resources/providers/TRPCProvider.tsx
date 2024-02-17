import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpLink, splitLink } from '@trpc/client';
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
  const headers = {
    Authorization: token !== null ? `Bearer ${token}` : undefined,
  };
  const trpcClient = trpc.createClient({
    links: [
      splitLink({
        condition(op) {
          return op.context.skipBatch === true;
        },
        true: httpLink({
          url: TRPC_API_URL,
          headers,
        }),
        false: httpBatchLink({
          url: TRPC_API_URL,
          headers,
        }),
      }),
    ],
  });
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
