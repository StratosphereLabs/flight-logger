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
}

export const UserSelect = <Values extends FieldValues>({
  followingUsersOnly,
  ...props
}: UserSelectProps<Values>): JSX.Element => {
  const isDarkMode = useIsDarkMode();
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data } = trpc.users.getUsers.useQuery(
    { query, followingUsersOnly },
    { enabled: query.length > 0, onError },
  );
  return (
    <TypeaheadSelect
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
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
