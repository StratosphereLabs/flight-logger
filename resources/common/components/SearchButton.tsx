import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Form, useOutsideClick } from 'stratosphere-ui';
import { type UsersRouterOutput } from '../../../app/routes/users';
import { SearchIcon } from './Icons';
import { UserSelect } from './UserInput';

export interface SearchButtonProps {
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

export interface UserSearchFormData {
  user: UsersRouterOutput['getUsers'][number] | null;
}

export const SearchButton = ({
  isSearching,
  setIsSearching,
}: SearchButtonProps): JSX.Element => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
  }, [navigate, setIsSearching, user]);
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
          <UserSelect
            disableSingleSelectBadge
            inputClassName="bg-base-200"
            menuClassName="min-w-full"
            name="user"
            onKeyDown={({ key }) => {
              if (key === 'Escape' || key === 'Tab') {
                setIsSearching(false);
                if (key !== 'Tab') setTimeout(() => buttonRef.current?.focus());
              }
            }}
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
          title="Search Users"
        >
          <SearchIcon className="h-5 w-5" />
          <span className="sr-only">Search Users</span>
        </Button>
      )}
    </>
  );
};
