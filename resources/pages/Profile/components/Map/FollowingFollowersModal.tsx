import { useNavigate, useParams } from '@tanstack/react-router';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { useForm, useWatch } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import {
  Avatar,
  Form,
  FormControl,
  Link,
  Loading,
  Modal,
  Table,
  useDebouncedValue,
} from 'stratosphere-ui';

import { SearchIcon } from '../../../../common/components';
import {
  DEBOUNCE_DEFAULT_DELAY,
  HIDE_SCROLLBAR_CLASSNAME,
} from '../../../../common/constants';
import { trpc } from '../../../../utils/trpc';
import { type SearchUsersFormData } from '../../../Users';

export interface FollowingFollowersModalProps {
  onClose: () => void;
  type: 'following' | 'followers' | null;
}

export const FollowingFollowersModal = ({
  onClose,
  type,
}: FollowingFollowersModalProps): JSX.Element => {
  const { username } = useParams({ strict: false });
  const navigate = useNavigate();
  const methods = useForm<SearchUsersFormData, ['searchQuery']>({
    defaultValues: {
      searchQuery: '',
    },
  });
  const query = useWatch<SearchUsersFormData, 'searchQuery'>({
    control: methods.control,
    name: 'searchQuery',
  });
  const { debouncedValue } = useDebouncedValue(query, DEBOUNCE_DEFAULT_DELAY);
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    trpc.users.getUserFollowingFollowers.useInfiniteQuery(
      {
        username,
        limit: 15,
        type,
        query: debouncedValue,
      },
      {
        enabled: type !== null,
        getNextPageParam: ({ metadata }) =>
          metadata.page < metadata.pageCount ? metadata.page + 1 : undefined,
      },
    );
  const { ref } = useInView({
    skip: isFetching || hasNextPage !== true,
    delay: 0,
    onChange: async inView => {
      if (inView) {
        await fetchNextPage();
      }
    },
  });
  const handleClose = (): void => {
    onClose();
    methods.reset();
  };
  const title = type === 'followers' ? 'Followers' : 'Following';
  return (
    <Modal
      className="overflow-y-hidden text-center"
      open={type !== null}
      actionButtons={[]}
      onClose={handleClose}
      title={`${username !== undefined ? `${username}'s ${title}` : title}${data?.pages[0] !== undefined ? ` (${data.pages[0].metadata.itemCount})` : ''}`}
    >
      <Form className="mt-4 mb-2" methods={methods}>
        <FormControl
          elementLeft={<SearchIcon className="ml-1 h-5 w-5" />}
          inputClassName="bg-base-200 pl-10"
          name="searchQuery"
        />
      </Form>
      <div
        className={classNames(
          'flex h-[min(80vh,600px)] flex-col overflow-y-scroll',
          HIDE_SCROLLBAR_CLASSNAME,
        )}
      >
        <Table
          cellClassNames={{
            avatar: 'w-[60px]',
            numFlights: 'w-[100px] text-right',
          }}
          className="flex-1 [&_td]:border-none [&_th]:border-none"
          columns={[
            {
              id: 'avatar',
              accessorKey: 'avatar',
              header: () => '',
              cell: ({ row }) => {
                const data = row.original;
                return (
                  <div className="flex flex-1 items-center justify-center">
                    <Avatar
                      alt={data?.username}
                      src={data?.avatar}
                      shapeClassName="w-9 h-9 rounded-full"
                    />
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
                      onClose();
                      void navigate({
                        to: '/user/$username',
                        params: { username },
                      });
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
              header: () => <span className="w-full text-right">Flights</span>,
              cell: ({ getValue }) => {
                const numFlights = getValue<number>();
                return <>{numFlights.toLocaleString()}</>;
              },
            },
          ]}
          data={
            data?.pages.flatMap(page =>
              page.results.map(item => ({
                ...item,
                id: item.username,
              })),
            ) ?? []
          }
          enableSorting={false}
          getCoreRowModel={getCoreRowModel()}
          headerClassName="sticky top-0 bg-base-100 z-[10]"
          isLoading={isFetching && !isFetchingNextPage}
          size="sm"
        />
        <div
          ref={ref}
          className={classNames(
            'min-h-[20px] w-full justify-center',
            hasNextPage === true ? 'flex' : 'hidden',
          )}
        >
          {isFetchingNextPage ? (
            <div className="flex gap-2 text-sm opacity-90">
              <Loading size="xs" />
              <span>Loading</span>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
