import { flexRender, TableOptions, useReactTable } from '@tanstack/react-table';
import { Table as DaisyUITable } from 'react-daisyui';
import { FullScreenLoader } from './FullScreenLoader';
import { HeaderSortIcon } from './HeaderSortIcon';
import { Pagination } from './Pagination';
import { PaginationMetadata } from '../types';

export type GenericDataType = Record<string, unknown>;

export type TableProps<DataType extends GenericDataType> = {
  compact?: boolean;
  enableGlobalFilter?: boolean;
  enableRowHover?: boolean;
  enableZebra?: boolean;
  isLoading?: boolean;
  metadata?: PaginationMetadata;
} & TableOptions<DataType>;

export const Table = <DataType extends Record<string, unknown>>({
  compact,
  enableGlobalFilter,
  enableRowHover,
  enableSorting,
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
    <div className="h-full flex flex-col justify-between">
      <DaisyUITable
        compact={compact}
        zebra={enableZebra}
        className="rounded-box"
      >
        <DaisyUITable.Head>
          {getHeaderGroups().flatMap(headerGroup =>
            headerGroup.headers.map(
              ({ column, getContext, id, isPlaceholder }) => (
                <span
                  key={id}
                  className={`flex items-center ${
                    column.getCanSort() ? 'cursor-pointer' : ''
                  }`}
                  onClick={
                    column.getCanSort()
                      ? column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  {isPlaceholder ? null : (
                    <>
                      {flexRender(column.columnDef.header, getContext())}
                      <HeaderSortIcon column={column} />
                    </>
                  )}
                </span>
              ),
            ),
          )}
        </DaisyUITable.Head>
        {isLoading !== true && (
          <DaisyUITable.Body>
            {getRowModel().rows.map(({ getVisibleCells, id }) => (
              <DaisyUITable.Row hover={enableRowHover} key={id}>
                {getVisibleCells().map(({ column, getContext }) => (
                  <>{flexRender(column.columnDef.cell, getContext())}</>
                ))}
              </DaisyUITable.Row>
            ))}
          </DaisyUITable.Body>
        )}
      </DaisyUITable>
      {isLoading === true && <FullScreenLoader />}
      <Pagination
        metadata={metadata}
        onPaginationChange={number => setPageIndex(number - 1)}
        size={compact === true ? 'sm' : undefined}
      />
    </div>
  );
};
