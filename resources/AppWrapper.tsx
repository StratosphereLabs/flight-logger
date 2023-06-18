import { type ReactNode } from 'react';
import { AlertMessagesProvider } from 'stratosphere-ui';
import { TRPCProvider } from './providers';

export interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => (
  <AlertMessagesProvider>
    <TRPCProvider>{children}</TRPCProvider>
  </AlertMessagesProvider>
);
