import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, TypeaheadSelect, useOutsideClick } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { SearchIcon } from './Icons';

export interface UserSearchFormData {
  username: string;
}

export const SearchButton = (): JSX.Element => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const { data } = trpc.users.getUsers.useQuery(
    { query },
    { enabled: query.length > 0 },
  );
  const methods = useForm<UserSearchFormData>({
    defaultValues: {
      username: '',
    },
  });
  const value = useWatch({
    control: methods.control,
    name: 'username',
  });
  useEffect(() => {
    if (value.length > 0) {
      setIsSearching(false);
      navigate(`/user/${value}`);
    }
  }, [value]);
  useOutsideClick(inputRef, event => {
    const element = event.target as HTMLElement;
    if (element.tagName !== 'A') setIsSearching(false);
  });
  return (
    <>
      {isSearching ? (
        <Form methods={methods} onFormSubmit={() => null}>
          <TypeaheadSelect
            disableSingleSelectBadge
            getItemText={({ username }) => username}
            getItemValue={({ username }) => username}
            inputRef={inputRef}
            menuClassName="min-w-full"
            name="username"
            onDebouncedChange={setQuery}
            options={data}
            placeholder="Search Users..."
          />
        </Form>
      ) : (
        <Button
          color="ghost"
          onClick={() => {
            setIsSearching(true);
            setTimeout(() => inputRef.current?.focus());
          }}
          shape="circle"
        >
          <SearchIcon />
          <span className="sr-only">Search Users</span>
        </Button>
      )}
    </>
  );
};
