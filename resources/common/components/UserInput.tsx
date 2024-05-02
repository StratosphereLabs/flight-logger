import { useState } from 'react';
import { type FieldValues } from 'react-hook-form';
import { TypeaheadSelect, type TypeaheadSelectProps } from 'stratosphere-ui';
import { type UsersRouterOutput } from '../../../app/routes/users';
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
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data } = trpc.users.getUsers.useQuery(
    { query, followingUsersOnly },
    { enabled: query.length > 0, onError },
  );
  return (
    <TypeaheadSelect
      getItemText={({ username }) => username}
      onDebouncedChange={setQuery}
      options={data}
      {...props}
    />
  );
};
