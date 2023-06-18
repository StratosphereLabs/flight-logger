import { type ReactNode } from 'react';

export interface DashboardContainerProps {
  children: ReactNode;
}

export const DashboardContainer = ({
  children,
}: DashboardContainerProps): JSX.Element => (
  <div className="flex flex-row flex-wrap justify-center gap-3">{children}</div>
);
