import { flexRender, TableOptions, useReactTable } from '@tanstack/react-table';
import { Table as DaisyUITable } from 'react-daisyui';
import { FullScreenLoader } from './FullScreenLoader';
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
      {isLoading === true ? (
        <FullScreenLoader />
      ) : (
        <DaisyUITable
          compact={compact}
          zebra={enableZebra}
          className="rounded-box w-full"
        >
          <DaisyUITable.Head>
            {getHeaderGroups().flatMap(headerGroup =>
              headerGroup.headers.map(header => (
                <span key={header.id}>
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </>
                  )}
                </span>
              )),
            )}
          </DaisyUITable.Head>
          <DaisyUITable.Body>
            {getRowModel().rows.map(row => (
              <DaisyUITable.Row hover={enableRowHover} key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </>
                ))}
              </DaisyUITable.Row>
            ))}
          </DaisyUITable.Body>
        </DaisyUITable>
      )}
      <Pagination
        metadata={metadata}
        onPaginationChange={number => setPageIndex(number - 1)}
        size={compact === true ? 'sm' : undefined}
      />
    </div>
  );
};
