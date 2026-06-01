import { useMemo } from 'react';
import {
  VisibilityState,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { inferColumns } from '../components/complex-cell-viewer';

interface UseResourceTableInstanceProps {
  data: unknown[];
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
}

export function useResourceTableInstance({
  data,
  sorting,
  setSorting,
  globalFilter,
  setGlobalFilter,
  columnVisibility,
  setColumnVisibility,
}: UseResourceTableInstanceProps) {
  const columns = useMemo(() => inferColumns(data), [data]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return { table, columns };
}
