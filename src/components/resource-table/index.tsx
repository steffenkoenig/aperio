'use client';

import { SortingState } from '@tanstack/react-table';
import { extractPathParamNames } from '@/lib/utils';
import { useResourceTable } from './hooks/useResourceTable';
import { useResourceTableState } from './hooks/useResourceTableState';
import { useResourceTableInstance } from './hooks/useResourceTableInstance';
import { ResourceTableToolbar } from './components/toolbar';
import { ResourceTableViewManager } from './components/view-manager';
import { ResourceTableContent } from './components/table-content';
import { ResourceTableMissingParams, ResourceTableError } from './components/empty-state';

export interface ResourceTableProps {
  path: string;
  pathParams?: Record<string, string>;
}

export function ResourceTable({ path, pathParams = {} }: ResourceTableProps) {
  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);
  const missingParams = extractPathParamNames(path).filter((name) => !pathParams[name]);

  const { data, isLoading, sorting, setSorting, globalFilter, setGlobalFilter, error, fetchData } =
    useResourceTable({ resolvedPath, missingParams });

  const { columnVisibility, setColumnVisibility, activeViewId, setActiveViewId } =
    useResourceTableState();

  const { table, columns } = useResourceTableInstance({
    data, sorting, setSorting, globalFilter, setGlobalFilter, columnVisibility, setColumnVisibility
  });

  if (missingParams.length > 0) return <ResourceTableMissingParams missingParams={missingParams} />;
  if (error) return <ResourceTableError error={error} retry={() => void fetchData()} />;

  return (
    <div className="space-y-3">
      <ResourceTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isLoading={isLoading}
        fetchData={fetchData}
        table={table}
      />

      <ResourceTableViewManager
        path={path}
        globalFilter={globalFilter}
        sorting={sorting as SortingState}
        columnVisibility={columnVisibility}
        setSorting={setSorting}
        setGlobalFilter={setGlobalFilter}
        setColumnVisibility={setColumnVisibility}
        activeViewId={activeViewId}
        setActiveViewId={setActiveViewId}
      />

      <ResourceTableContent
        table={table}
        isLoading={isLoading}
        columns={columns}
      />
    </div>
  );
}
