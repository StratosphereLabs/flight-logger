import { getCoreRowModel } from '@tanstack/react-table';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormControl,
  Link,
  Loading,
  Table,
  useDebouncedValue,
} from 'stratosphere-ui';

import { SearchIcon } from '../../common/components';
import { useProtectedPage, useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export interface SearchUsersFormData {
  searchQuery: string;
}

export const Users = (): JSX.Element => {
  const isLoggedIn = useProtectedPage();
  const navigate = useNavigate();
  const onError = useTRPCErrorHandler();
  const methods = useForm<SearchUsersFormData, ['searchQuery']>({
    defaultValues: {
      searchQuery: '',
    },
  });
  const query = useWatch<SearchUsersFormData, 'searchQuery'>({
    control: methods.control,
    name: 'searchQuery',
  });
  const { debouncedValue } = useDebouncedValue(query, 400);
  const { data, isFetching } = trpc.users.searchUsers.useQuery(
    {
      query: query !== '' ? debouncedValue : query,
    },
    { enabled: isLoggedIn, onError },
  );
  return (
    <div className="mt-16 flex flex-1 flex-col items-center p-2 sm:p-3">
      <Card className="flex w-full max-w-[750px] flex-col justify-center bg-base-100">
        <CardBody>
          <CardTitle className="justify-center">User Search</CardTitle>
          <Form className="mt-2" methods={methods}>
            <FormControl
              elementLeft={<SearchIcon className="ml-1 h-5 w-5" />}
              elementRight={isFetching ? <Loading /> : null}
              inputClassName="bg-base-200 pl-10"
              name="searchQuery"
            />
          </Form>
          {data !== undefined && data.length > 0 ? (
            <Table
              cellClassNames={{
                avatar: 'w-[60px]',
                numFlights: 'w-[100px]',
              }}
              columns={[
                {
                  id: 'avatar',
                  accessorKey: 'avatar',
                  header: () => '',
                  cell: ({ row }) => {
                    const data = row.original;
                    return (
                      <div className="flex flex-1 items-center justify-center">
                        <Avatar shapeClassName="w-9 h-9 rounded-full">
                          <img alt={data?.username} src={data?.avatar} />
                        </Avatar>
                      </div>
                    );
                  },
                },
                {
                  id: 'username',
                  accessorKey: 'username',
                  header: () => 'Username',
                  cell: ({ getValue }) => {
                    const username = getValue<string>();
                    return (
                      <Link
                        className="font-bold"
                        hover
                        onClick={() => {
                          navigate(`/user/${username}`);
                        }}
                      >
                        {username}
                      </Link>
                    );
                  },
                },
                {
                  id: 'numFlights',
                  accessorKey: 'numFlights',
                  header: () => 'Flights',
                },
              ]}
              data={data ?? []}
              enableSorting={false}
              getCoreRowModel={getCoreRowModel()}
              size="sm"
            />
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
};
