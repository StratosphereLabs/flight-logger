import { ReactNode } from 'react';

export interface DashboardContainerProps {
  children: ReactNode;
}

export const DashboardContainer = ({
  children,
}: DashboardContainerProps): JSX.Element => (
  <div className="p-4 flex flex-row space-x-4">{children}</div>
);
