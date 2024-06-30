import { DataImport } from './DataImport';
import { Notifications } from './Notifications';

export interface NotificationsForm {
  pushNotifications: boolean;
}

export const Account = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-4 p-2 sm:p-3">
      <article className="prose self-center">
        <h2>My Account</h2>
      </article>
      <Notifications />
      <DataImport />
    </div>
  );
};
