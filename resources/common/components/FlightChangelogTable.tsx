import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { format, formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Link, Loading, Table } from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import viteIcon from '../../../resources/assets/vite.svg';
import { trpc } from '../../utils/trpc';
import {
  DATE_FORMAT,
  DEFAULT_EXPANDED_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  TIME_FORMAT_12H,
} from '../constants';
import { CollapseIcon, ExpandIcon, FlightChangeValue, TimeIcon } from '.';

export interface FlightChangelogTableProps {
  className?: string;
  containerClassName?: string;
  expandedContainerClassName?: string;
  expandedPageSize?: number;
  flight: FlightsRouterOutput['getFollowingFlights']['completedFlights'][number];
  pageSize?: number;
}

export const FlightChangelogTable = ({
  className,
  containerClassName,
  expandedContainerClassName,
  expandedPageSize,
  flight,
  pageSize,
}: FlightChangelogTableProps): JSX.Element | null => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [keepPreviousData, setKeepPreviousData] = useState(false);
  const limit = useMemo(
    () =>
      isExpanded
        ? expandedPageSize ?? DEFAULT_EXPANDED_PAGE_SIZE
        : pageSize ?? DEFAULT_PAGE_SIZE,
    [expandedPageSize, isExpanded, pageSize],
  );
  const {
    data,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
  } = trpc.flights.getFlightChangelog.useInfiniteQuery(
    {
      id: flight.id,
      limit,
    },
    {
      getNextPageParam: ({ metadata }) =>
        metadata.page < metadata.pageCount ? metadata.page + 1 : undefined,
      keepPreviousData,
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
  const tableData = useMemo(
    () => data?.pages.flatMap(({ results }) => results) ?? [],
    [data?.pages],
  );
  useEffect(() => {
    if (!isFetching) {
      setKeepPreviousData(false);
    }
  }, [isFetching]);
  useEffect(() => {
    setIsExpanded(false);
  }, [flight]);
  return (
    <div
      className={classNames(
        'flex w-full flex-col items-center gap-1',
        className,
      )}
    >
      {isLoading ? <Loading /> : null}
      {data !== undefined && tableData.length > 0 ? (
        <>
          <div className="relative flex w-full justify-center">
            <span className="mb-2">Event Log</span>
            <Button
              className="absolute right-0"
              color="ghost"
              onClick={() => {
                setKeepPreviousData(true);
                setIsExpanded(expanded => !expanded);
              }}
              size="sm"
            >
              {isExpanded ? (
                <CollapseIcon className="h-4 w-4" />
              ) : (
                <ExpandIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div
            className={classNames(
              'flex flex-col gap-2 overflow-y-scroll',
              isExpanded
                ? expandedContainerClassName ?? 'max-h-[550px]'
                : containerClassName ?? 'max-h-[200px]',
            )}
          >
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
                              {change.oldValue !== null ? '-' : ''}
                              <FlightChangeValue
                                field={change.field}
                                flightData={row.original}
                                value={change.oldValue}
                              />
                            </div>
                            <div className="flex flex-1 gap-1 font-semibold text-success">
                              {change.newValue !== null ? '+' : ''}
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
              data={tableData}
              enableRowHover
              enableSorting={false}
              getCoreRowModel={getCoreRowModel()}
              hideHeader
              size="xs"
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
        </>
      ) : null}
      {data !== undefined && tableData.length === 0 ? (
        <div className="opacity-90">No events found</div>
      ) : null}
    </div>
  );
};
