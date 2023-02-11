import { useRef, useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { Form, TypeaheadSelect, useOutsideClick } from 'stratosphere-ui';
import { trpc } from '../../utils/trpc';
import { SearchIcon } from './Icons';

export const SearchButton = (): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { data } = trpc.users.getUsers.useQuery(
    { query },
    { enabled: query.length > 0 },
  );
  const methods = useForm({
    defaultValues: {
      query: '',
    },
  });
  useOutsideClick(inputRef, () => setIsSearching(false));
  return (
    <>
      {isSearching ? (
        <Form methods={methods} onFormSubmit={() => null}>
          <TypeaheadSelect
            disableSingleSelectBadge
            getItemText={({ username }) => username}
            inputRef={inputRef}
            name="query"
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
        </Button>
      )}
    </>
  );
};
