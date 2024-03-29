import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  TypeaheadSelect,
  useOutsideClick,
} from 'stratosphere-ui';
import { type UsersRouterOutput } from '../../../app/routes/users';
import { trpc } from '../../utils/trpc';
import { useTRPCErrorHandler } from '../hooks';
import { SearchIcon } from './Icons';

export interface UserSearchFormData {
  user: UsersRouterOutput['getUsers'][number] | null;
}

export const SearchButton = (): JSX.Element => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const onError = useTRPCErrorHandler();
  const { data } = trpc.users.getUsers.useQuery(
    { query },
    { enabled: query.length > 0, onError },
  );
  const methods = useForm<UserSearchFormData>({
    defaultValues: {
      user: null,
    },
  });
  const user = useWatch<UserSearchFormData, 'user'>({
    control: methods.control,
    name: 'user',
  });
  useEffect(() => {
    if (user !== null) {
      setIsSearching(false);
      navigate(`/user/${user.username}`);
    }
  }, [navigate, user]);
  useEffect(() => {
    if (!isSearching) {
      methods.reset();
    }
  }, [isSearching, methods]);
  useOutsideClick(formRef, event => {
    const element = event.target as HTMLElement;
    if (element.tagName !== 'A') setIsSearching(false);
  });
  return (
    <>
      {isSearching ? (
        <Form methods={methods} onFormSubmit={() => null} formRef={formRef}>
          <TypeaheadSelect
            disableSingleSelectBadge
            getItemText={({ username }) => username}
            inputClassName="bg-base-200"
            menuClassName="min-w-full"
            name="user"
            onDebouncedChange={setQuery}
            onKeyDown={({ key }) => {
              if (key === 'Escape' || key === 'Tab') {
                setIsSearching(false);
                if (key !== 'Tab') setTimeout(() => buttonRef.current?.focus());
              }
            }}
            options={data}
            placeholder="Search Users..."
          />
        </Form>
      ) : (
        <Button
          color="ghost"
          onClick={() => {
            setIsSearching(true);
            setTimeout(() => {
              methods.setFocus('user');
            }, 100);
          }}
          ref={buttonRef}
          shape="circle"
        >
          <SearchIcon className="h-5 w-5" />
          <span className="sr-only">Search Users</span>
        </Button>
      )}
    </>
  );
};
