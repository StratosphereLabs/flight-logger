import classNames from 'classnames';
import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import {
  Avatar,
  TypeaheadSelect,
  type TypeaheadSelectProps,
} from 'stratosphere-ui';

import { type UsersRouterOutput } from '../../../app/routes/users';
import { useIsDarkMode } from '../../stores';
import { trpc } from '../../utils/trpc';
import { useTRPCErrorHandler } from '../hooks';

export interface UserSelectProps<Values extends FieldValues>
  extends Omit<
    TypeaheadSelectProps<UsersRouterOutput['getUsers'][number], Values>,
    'getItemText' | 'onDebouncedChange' | 'options'
  > {
  followingUsersOnly?: boolean;
  max?: number;
  withoutFlightId?: string;
}

export const UserSelect = <Values extends FieldValues>({
  defaultShowDropdown,
  followingUsersOnly,
  max,
  withoutFlightId,
  ...props
}: UserSelectProps<Values>): JSX.Element => {
  const isDarkMode = useIsDarkMode();
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(defaultShowDropdown ?? false);
  const onError = useTRPCErrorHandler();
  const { data, isLoading } = trpc.users.getUsers.useQuery(
    { query, followingUsersOnly, max, withoutFlightId },
    { enabled, onError },
  );
  return (
    <TypeaheadSelect
      defaultShowDropdown={defaultShowDropdown}
      getBadgeClassName={() =>
        classNames('badge-lg', !isDarkMode && 'badge-ghost bg-base-100')
      }
      getItemText={({ avatar, username }) => (
        <div className="flex items-center gap-2 overflow-hidden text-sm">
          <Avatar
            alt={username}
            src={avatar}
            shapeClassName="w-5 h-5 rounded-full"
          />
          <span className="flex-1 truncate">{username}</span>
        </div>
      )}
      isLoading={isLoading}
      onDebouncedChange={setQuery}
      onShowDropdown={setEnabled}
      options={data}
      {...props}
    />
  );
};
