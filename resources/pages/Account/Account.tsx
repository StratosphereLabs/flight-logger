import { DataImport } from './DataImport';
import { NotificationSettings } from './NotificationSettings';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';

export interface NotificationsForm {
  pushNotifications: boolean;
}

export const Account = (): JSX.Element => {
  return (
    <div className="mt-16 flex flex-col gap-4 p-2 sm:p-3">
      <article className="prose self-center">
        <h2>My Account</h2>
      </article>

      <ProfileSettings />
      <SecuritySettings />

      <NotificationSettings />
      <DataImport />
    </div>
  );
};
