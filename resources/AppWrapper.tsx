import { ReactNode } from 'react';
import { AppContextProvider, TRPCProvider } from './providers';

export interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => (
  <AppContextProvider>
    <TRPCProvider>{children}</TRPCProvider>
  </AppContextProvider>
);
