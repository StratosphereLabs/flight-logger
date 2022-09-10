import { DashboardContainerProps } from './types';

export const DashboardContainer = ({
  children,
}: DashboardContainerProps): JSX.Element => (
  <div className="p-4 flex flex-row space-x-4">{children}</div>
);
