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
        limit: 15,
      },
      {
        enabled: open,
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
  return (
    <Modal
      className="max-h-[90vh] overflow-y-hidden text-center"
      open={open}
      actionButtons={[]}
      onClose={onClose}
      title={`${username !== undefined ? `${username}'s Followers` : 'Followers'}${data?.pages[0] !== undefined ? ` (${data.pages[0].metadata.itemCount})` : ''}`}
    >
      <div className="flex max-h-[80vh] flex-col overflow-y-scroll">
        <Table
          cellClassNames={{
            avatar: 'w-[60px]',
            numFlights: 'w-[100px] text-right',
          }}
          className="[&_td]:border-none [&_th]:border-none"
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
