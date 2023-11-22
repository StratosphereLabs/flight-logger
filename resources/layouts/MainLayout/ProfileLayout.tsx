import { Outlet } from '@tanstack/react-router';
import { Card } from 'stratosphere-ui';
import { ProfileTabs } from './ProfileTabs';

export const ProfileLayout = (): JSX.Element => (
  <Card className="m-2 flex-1 overflow-y-hidden bg-base-100 shadow-md">
    <ProfileTabs />
    <div className="flex flex-1 flex-col overflow-y-scroll p-2 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:scrollbar">
      <Outlet />
    </div>
  </Card>
);
