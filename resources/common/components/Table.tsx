import { flexRender, TableOptions, useReactTable } from '@tanstack/react-table';
import { Button, Pagination, Table as DaisyUITable } from 'react-daisyui';
import { useScrollBar } from '../hooks';
import { PaginationMetadata } from '../types';

export type GenericDataType = Record<string, unknown>;

export type TableProps<DataType extends GenericDataType> = {
  compact?: boolean;
  enableGlobalFilter?: boolean;
  enableRowHover?: boolean;
  enableZebra?: boolean;
  metadata?: PaginationMetadata;
} & TableOptions<DataType>;

export const Table = <DataType extends Record<string, unknown>>({
  compact,
  enableGlobalFilter,
  enableRowHover,
  enableZebra,
  initialState,
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
  const scrollBarClassName = useScrollBar();
  return (
    <div className={`overflow-x-scroll w-full ${scrollBarClassName}`}>
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
                <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
              ))}
            </DaisyUITable.Row>
          ))}
        </DaisyUITable.Body>
      </DaisyUITable>
      {metadata !== undefined ? (
        <Pagination className="mt-2 float-right">
          {metadata?.pages.map(({ number }) => (
            <Button
              active={number === metadata.page}
              key={number}
              onClick={() => setPageIndex(number - 1)}
            >
              {number}
            </Button>
          ))}
        </Pagination>
      ) : null}
    </div>
  );
};
