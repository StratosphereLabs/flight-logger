import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { format, formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Link, Loading, Table } from 'stratosphere-ui';
import { type FlightsRouterOutput } from '../../../app/routes/flights';
import viteIcon from '../../../resources/assets/vite.svg';
import { CollapseIcon, ExpandIcon, TimeIcon } from '../../common/components';
import { trpc } from '../../utils/trpc';
import {
  DATE_FORMAT,
  DEFAULT_CONTAINER_HEIGHT,
  DEFAULT_EXPANDED_CONTAINER_HEIGHT,
  DEFAULT_EXPANDED_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  TIME_FORMAT_12H,
} from './constants';
import { FlightChangeValue } from './FlightChangeValue';

export interface FlightChangelogTableProps {
  className?: string;
  containerClassName?: string;
  containerHeight?: number;
  expandedContainerClassName?: string;
  expandedContainerHeight?: number;
  expandedPageSize?: number;
  flight: FlightsRouterOutput['getFollowingFlights']['completedFlights'][number];
  pageSize?: number;
}

export const FlightChangelogTable = ({
  className,
  containerClassName,
  containerHeight,
  expandedContainerClassName,
  expandedContainerHeight,
  expandedPageSize,
  flight,
  pageSize,
}: FlightChangelogTableProps): JSX.Element | null => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
    isFetching,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    fetchNextPage,
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
  const tableContainerHeight = useMemo(
    () =>
      isExpanded
        ? expandedContainerHeight ?? DEFAULT_EXPANDED_CONTAINER_HEIGHT
        : containerHeight ?? DEFAULT_CONTAINER_HEIGHT,
    [containerHeight, expandedContainerHeight, isExpanded],
  );
  useEffect(() => {
    if (!isFetching) {
      setKeepPreviousData(false);
    }
  }, [isFetching]);
  useEffect(() => {
    if (data !== undefined) {
      const scrollContainer = scrollContainerRef.current;
      const callback = (event: Event): void => {
        const target = event.target as HTMLDivElement;
        const diff = tableContainerHeight + 25;
        if (
          target.scrollHeight - target.scrollTop <= diff &&
          hasNextPage === true
        ) {
          void fetchNextPage();
        }
      };
      scrollContainer?.addEventListener('scroll', callback);
      return () => {
        scrollContainer?.removeEventListener('scroll', callback);
      };
    }
  }, [data, fetchNextPage, hasNextPage, tableContainerHeight]);
  if (data !== undefined && data.pages[0].metadata.itemCount === 0) {
    return null;
  }
  return (
    <div
      className={classNames(
        'flex w-full flex-col items-center gap-1',
        className,
      )}
    >
      {isLoading ? <Loading /> : null}
      {data !== undefined ? (
        <>
          <div className="flex w-full justify-between">
            <div />
            <span>Event Log</span>
            <Button
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
            ref={scrollContainerRef}
            className={classNames(
              'flex flex-col gap-2 overflow-y-scroll',
              isExpanded ? 'max-h-[550px]' : 'max-h-[200px]',
              isExpanded ? expandedContainerClassName : containerClassName,
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
              data={data.pages.flatMap(({ results }) => results)}
              enableRowHover
              enableSorting={false}
              getCoreRowModel={getCoreRowModel()}
              hideHeader
              size="xs"
            />
            {isFetchingNextPage ? (
              <div className="flex w-full items-center justify-center gap-2 text-sm opacity-90">
                <Loading size="xs" />
                <span>Loading</span>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
};
