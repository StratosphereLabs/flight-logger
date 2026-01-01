import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { type ReactNode } from 'react';
import { AlertMessagesProvider, Loading } from 'stratosphere-ui';

import { TRPCProvider } from './providers';

export interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => {
  const { client } = useClientAsyncInit(
    import.meta.env.VITE_STATSIG_API_KEY as string,
    {},
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
    },
  );
  return (
    <StatsigProvider client={client} loadingComponent={<Loading />}>
      <AlertMessagesProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </AlertMessagesProvider>
    </StatsigProvider>
  );
};
