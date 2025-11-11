import { getCoreRowModel } from '@tanstack/react-table';
import classNames from 'classnames';
import { format, formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Avatar, Link, Loading, Table } from 'stratosphere-ui';

import { TimeIcon } from '..';
import viteIcon from '../../../../resources/assets/vite.svg';
import { AppTheme, useThemeStore } from '../../../stores';
import { trpc } from '../../../utils/trpc';
import {
  DATE_FORMAT,
  DEFAULT_PAGE_SIZE,
  HIDE_SCROLLBAR_CLASSNAME,
  TIME_FORMAT_12H,
} from '../../constants';
import { useCardClassNames } from '../../hooks';
import { FlightChangeValue } from './FlightChangeValue';

export interface FlightChangelogTableProps {
  className?: string;
  flightId?: string;
  pageSize?: number;
}

export const FlightChangelogTable = ({
  className,
  flightId,
  pageSize,
}: FlightChangelogTableProps): JSX.Element | null => {
  const navigate = useNavigate();
  const [keepPreviousData, setKeepPreviousData] = useState(false);
  const { theme } = useThemeStore();
  const cardClassNames = useCardClassNames();
  const limit = pageSize ?? DEFAULT_PAGE_SIZE;
  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    trpc.flights.getFlightChangelog.useInfiniteQuery(
      {
        id: flightId ?? '',
        limit,
      },
      {
        enabled: flightId !== undefined,
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
  return (
    <div
      className={classNames(
        'flex w-full flex-col items-center gap-1',
        cardClassNames,
        className,
      )}
    >
      {data !== undefined && tableData.length > 0 ? (
        <>
          <div className="relative flex w-full justify-center">
            <span className="my-2 w-full font-semibold">Event Log</span>
          </div>
          <div
            className={classNames(
              'flex max-h-[550px] flex-col gap-2 overflow-y-scroll',
              HIDE_SCROLLBAR_CLASSNAME,
            )}
          >
            <Table
              className="table-fixed"
              cellClassNames={{
                createdAt: classNames('w-[110px]'),
                changedByUser: classNames('w-[35px]'),
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
                        <Avatar
                          alt={user?.username ?? 'FlightLogger'}
                          src={user?.avatar ?? viteIcon}
                          shapeClassName="w-4 h-4 lg:w-5 lg:h-5 rounded-full"
                        />
                        {user !== null ? (
                          <Link
                            hover
                            onClick={() => {
                              navigate(`/user/${user.username}`);
                            }}
                            className={classNames(
                              'hidden truncate font-semibold opacity-80 lg:text-sm',
                            )}
                          >
                            {user.username}
                          </Link>
                        ) : (
                          <div className={classNames('hidden')}>
                            FlightLogger
                          </div>
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
                            <div
                              className={classNames(
                                'text-error flex flex-1 gap-1',
                                [AppTheme.CYBERPUNK].includes(theme) &&
                                  'brightness-90',
                              )}
                            >
                              {change.oldValue !== null ? '-' : ''}
                              <FlightChangeValue
                                field={change.field}
                                flightData={row.original}
                                value={change.oldValue}
                              />
                            </div>
                            <div
                              className={classNames(
                                'text-success flex flex-1 gap-1 font-semibold',
                                [AppTheme.CYBERPUNK].includes(theme) &&
                                  'brightness-90',
                              )}
                            >
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
