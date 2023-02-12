import { Outlet } from 'react-router-dom';
import { ProfileTabs } from './ProfileTabs';

export const ProfileLayout = (): JSX.Element => (
  <div className="flex flex-1 flex-col gap-3 p-3">
    <ProfileTabs />
    <Outlet />
  </div>
);
