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
} from 'stratosphere-ui';
import { SearchIcon } from '../../common/components';
import { trpc } from '../../utils/trpc';

export interface SearchUsersFormData {
  searchQuery: string;
}

export const Users = (): JSX.Element => {
  const navigate = useNavigate();
  const methods = useForm<SearchUsersFormData>({
    defaultValues: {
      searchQuery: '',
    },
  });
  const searchQuery = useWatch<SearchUsersFormData, 'searchQuery'>({
    control: methods.control,
    name: 'searchQuery',
  });
  const { data, isFetching } = trpc.users.searchUsers.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 },
  );
  return (
    <Card className="m-2 mt-1 flex-1 overflow-y-hidden bg-base-100 shadow-md">
      <CardBody>
        <CardTitle>Search Users</CardTitle>
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
                id: 'name',
                header: () => 'Name',
                cell: ({ row }) => (
                  <>
                    {row.original.firstName} {row.original.lastName}
                  </>
                ),
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
  );
};
