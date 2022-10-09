import { flexRender, TableOptions, useReactTable } from '@tanstack/react-table';
import classNames from 'classnames';
import { FullScreenLoader } from './FullScreenLoader';
import { HeaderSortIcon } from './HeaderSortIcon';
import { Pagination } from './Pagination';
import { PaginationMetadata } from '../types';

export type GenericDataType = Record<string, unknown>;

export type TableProps<DataType extends GenericDataType> = {
  compact?: boolean;
  enableFixedWidth?: boolean;
  enableGlobalFilter?: boolean;
  enableRowHover?: boolean;
  enableZebra?: boolean;
  isLoading?: boolean;
  metadata?: PaginationMetadata;
} & TableOptions<DataType>;

export const Table = <DataType extends Record<string, unknown>>({
  compact,
  enableFixedWidth,
  enableGlobalFilter,
  enableRowHover,
  enableZebra,
  initialState,
  isLoading,
  metadata,
  ...props
}: TableProps<DataType>): JSX.Element => {
  const tableInstance = useReactTable<DataType>({
    enableGlobalFilter,
    globalFilterFn: 'includesString',
    initialState: {
      globalFilter: '',
      ...initialState,
    },
    ...props,
  });
  const { getHeaderGroups, getRowModel, setPageIndex } = tableInstance;
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <table
          className={classNames('table', 'w-full', 'rounded-box', {
            'table-compact': compact,
            'table-fixed': enableFixedWidth,
            'table-zebra': enableZebra,
          })}
        >
          <thead>
            {getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(
                  ({ column, getContext, id, isPlaceholder }) => (
                    <th
                      key={id}
                      className={classNames({
                        'cursor-pointer': column.getCanSort(),
                      })}
                      onClick={
                        column.getCanSort()
                          ? column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {isPlaceholder ? null : (
                        <div className="flex items-center">
                          {flexRender(column.columnDef.header, getContext())}
                          <HeaderSortIcon column={column} />
                        </div>
                      )}
                    </th>
                  ),
                )}
              </tr>
            ))}
          </thead>
          {isLoading !== true && (
            <tbody>
              {getRowModel().rows.map(({ getVisibleCells, id }) => (
                <tr
                  className={enableRowHover === true ? 'hover' : undefined}
                  key={id}
                >
                  {getVisibleCells().map(({ column, getContext }) => (
                    <td key={column.id}>
                      {flexRender(column.columnDef.cell, getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {isLoading === true && <FullScreenLoader />}
      </div>
      <Pagination
        metadata={metadata}
        onPaginationChange={number => setPageIndex(number - 1)}
        size={compact === true ? 'sm' : undefined}
      />
    </div>
  );
};
