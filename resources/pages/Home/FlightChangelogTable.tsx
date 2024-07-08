import { getCoreRowModel } from '@tanstack/react-table';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Link, Loading, Table } from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import viteIcon from '../../../resources/assets/vite.svg';
import { TimeIcon } from '../../common/components';
import { trpc } from '../../utils/trpc';
import { DATE_FORMAT, TIME_FORMAT_12H } from './constants';
import { FlightChangeValue } from './FlightChangeValue';

export interface FlightChangelogTableProps {
  flight: FlightsRouterOutput['getFollowingFlights']['completedFlights'][number];
}

export const FlightChangelogTable = ({
  flight,
}: FlightChangelogTableProps): JSX.Element => {
  const navigate = useNavigate();
  const { data, isFetching, isLoading, hasNextPage, fetchNextPage } =
    trpc.flights.getFlightChangelog.useInfiniteQuery(
      {
        id: flight.id,
        limit: 5,
      },
      {
        getNextPageParam: ({ metadata }) =>
          metadata.page < metadata.pageCount ? metadata.page + 1 : undefined,
      },
    );
  return (
    <div className="flex w-full flex-col items-center gap-1">
      {isLoading ? <Loading /> : null}
      {data !== undefined ? (
        <>
          <div>Flight Changelog</div>
          <Table
            className="table-fixed"
            cellClassNames={{
              createdAt: 'w-[90px] sm:w-[190px]',
              changedByUser: 'w-[32px] sm:w-[150px]',
            }}
            columns={[
              {
                id: 'createdAt',
                accessorKey: 'createdAt',
                header: () => 'Timestamp',
                cell: ({ getValue }) => {
                  const timestamp = getValue<string>();
                  const time = format(new Date(timestamp), TIME_FORMAT_12H);
                  const date = format(new Date(timestamp), DATE_FORMAT);
                  const distanceToNow = formatDistanceToNow(
                    new Date(timestamp),
                  );
                  return (
                    <div className="flex items-center gap-2 text-xs">
                      <TimeIcon className="hidden h-5 w-5 opacity-75 sm:block" />
                      <div className="flex flex-col">
                        <div className="opacity-90">{`${date} ${time}`}</div>
                        <div className="opacity-60">{distanceToNow} ago</div>
                      </div>
                    </div>
                  );
                },
              },
              {
                id: 'changedByUser',
                accessorKey: 'changedByUser',
                header: () => 'User',
                cell: ({ row }) => {
                  const user = row.original.changedByUser;
                  return (
                    <div className="flex flex-1 flex-col gap-x-2 truncate text-xs sm:flex-row sm:items-center">
                      <Avatar shapeClassName="w-4 h-4 lg:w-5 lg:h-5 rounded-full">
                        <img
                          alt={user?.username ?? 'FlightLogger'}
                          src={user?.avatar ?? viteIcon}
                        />
                      </Avatar>
                      {user !== null ? (
                        <Link
                          hover
                          onClick={() => {
                            navigate(`/user/${user.username}`);
                          }}
                          className="hidden truncate font-semibold opacity-80 sm:block lg:text-sm"
                        >
                          {user.username}
                        </Link>
                      ) : (
                        <div className="hidden sm:block">FlightLogger</div>
                      )}
                    </div>
                  );
                },
              },
              {
                id: 'changes',
                accessorKey: 'changes',
                header: () => 'Changes',
                cell: ({ row }) => {
                  const changes = row.original.changes;
                  return (
                    <div className="flex flex-col gap-1">
                      {changes.map(change => (
                        <div
                          key={change.id}
                          className="flex items-center gap-1 text-xs"
                        >
                          <div className="flex-1 font-semibold">
                            {change.fieldText}
                          </div>
                          <div className="flex flex-1 gap-1 text-error">
                            -
                            <FlightChangeValue
                              field={change.field}
                              flightData={row.original}
                              value={change.oldValue}
                            />
                          </div>
                          <div className="flex flex-1 gap-1 font-semibold text-success">
                            +
                            <FlightChangeValue
                              field={change.field}
                              flightData={row.original}
                              value={change.newValue}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                },
              },
            ]}
            data={data.pages.flatMap(({ results }) => results)}
            enableSorting={false}
            getCoreRowModel={getCoreRowModel()}
            hideHeader
            size="xs"
          />
          {hasNextPage === true ? (
            <Button
              disabled={isFetching}
              loading={isFetching}
              onClick={() => {
                void fetchNextPage();
              }}
              size="sm"
            >
              Load More
            </Button>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
