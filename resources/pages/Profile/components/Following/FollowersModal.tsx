import { useNavigate, useParams } from '@tanstack/react-router';
import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { Avatar, Link, Loading, Modal, Table } from 'stratosphere-ui';

import { trpc } from '../../../../utils/trpc';

export interface FollowersModalProps {
  open: boolean;
  onClose: () => void;
}

export const FollowersModal = ({
  open,
  onClose,
}: FollowersModalProps): JSX.Element => {
  const { username } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    trpc.users.getUserFollowers.useInfiniteQuery(
      {
        username,
        limit: 25,
      },
      {
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

  console.log('Follower Data:', data);

  return (
    <Modal
      className="text-center"
      open={open}
      actionButtons={[]}
      onClose={onClose}
      title="Followers"
    >
      {data?.pages !== undefined ? (
        <>
          <div className="max-h-[75vh] overflow-y-scroll">
            <Table
              className="h-30"
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
                    console.log(data);
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
                  header: () => 'Flights',
                },
              ]}
              data={
                data.pages.flatMap(page =>
                  page.results.map(item => ({
                    ...item,
                    id: item.username,
                  })),
                ) ?? []
              }
              enableSorting={false}
              getCoreRowModel={getCoreRowModel()}
              size="sm"
            />
          </div>
          <div
            ref={ref}
            className={classNames(
              'h-[20px] w-full justify-center',
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
        </>
      ) : null}
    </Modal>
  );
};
