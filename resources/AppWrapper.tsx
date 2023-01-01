import { ReactNode } from 'react';
import { AlertMessagesProvider } from 'stratosphere-ui';
import { AppContextProvider, TRPCProvider } from './providers';

export interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => (
  <AppContextProvider>
    <AlertMessagesProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </AlertMessagesProvider>
  </AppContextProvider>
);
