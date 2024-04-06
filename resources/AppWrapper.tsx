import { type ReactNode } from 'react';
import { TRPCProvider } from './providers';

export interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps): JSX.Element => (
  <TRPCProvider>{children}</TRPCProvider>
);
