import { DataImport } from './DataImport';
import { LinkAccount } from './LinkAccount';
import { Notifications } from './Notifications';

export interface NotificationsForm {
  pushNotifications: boolean;
}

export const Account = (): JSX.Element => {
  return (
    <div className="mt-16 flex flex-col gap-4 p-2 sm:p-3">
      <article className="prose self-center">
        <h2>My Account</h2>
      </article>
      <div className="flex flex-row gap-3">
        <div className="flex-1">
          <LinkAccount />
        </div>
        <div className="flex">
          <Notifications />
        </div>
      </div>

      <div className="flex flex-row">
        <div className="flex">
          <DataImport />
        </div>
      </div>
    </div>
  );
};
