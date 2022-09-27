import {
  ColumnFiltersState,
  flexRender,
  SortingState,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect } from 'react';
import { Table as DaisyUITable } from 'react-daisyui';

export type GenericDataType = Record<string, unknown>;

export interface TableFetchOptions {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  sorting: SortingState;
}

export type TableProps<DataType extends GenericDataType> = {
  enableGlobalFilter?: boolean;
  enableRowHover?: boolean;
  onOptionsChange?: (fetchOptions: TableFetchOptions) => void;
} & TableOptions<DataType>;

export const Table = <DataType extends Record<string, unknown>>({
  enableGlobalFilter,
  enableRowHover,
  initialState,
  onOptionsChange: onFetchData,
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
  const { getHeaderGroups, getRowModel, getState } = tableInstance;
  const { columnFilters, sorting } = getState();
  const globalFilter = getState().globalFilter as string;
  useEffect(() => {
    onFetchData?.({ columnFilters, globalFilter, sorting });
  }, [onFetchData, columnFilters, globalFilter, sorting]);
  return (
    <DaisyUITable className="rounded-box w-full">
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
              <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
            ))}
          </DaisyUITable.Row>
        ))}
      </DaisyUITable.Body>
    </DaisyUITable>
  );
};
