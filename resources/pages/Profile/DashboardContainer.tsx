import { ReactNode } from 'react';

export interface DashboardContainerProps {
  children: ReactNode;
}

export const DashboardContainer = ({
  children,
}: DashboardContainerProps): JSX.Element => (
  <div className="p-4 flex flex-wrap flex-row justify-center gap-4">
    {children}
  </div>
);
