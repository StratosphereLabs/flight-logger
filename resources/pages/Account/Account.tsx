import { useStatsigClient } from '@statsig/react-bindings';
import { useEffect } from 'react';

import { CalendarSync } from './CalendarSync';
import { DataImport } from './DataImport';
import { Notifications } from './Notifications';

export interface NotificationsForm {
  pushNotifications: boolean;
}

export const Account = (): JSX.Element => {
  const { client } = useStatsigClient();
  useEffect(() => {
    client.logEvent('account_page_viewed');
  }, [client]);
  return (
    <div className="mt-16 flex flex-col gap-4 p-2 sm:p-3">
      <article className="prose self-center">
        <h2>My Account</h2>
      </article>
      <Notifications />
      <CalendarSync />
      <DataImport />
    </div>
  );
};
