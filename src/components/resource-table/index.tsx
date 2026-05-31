'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, RefreshCw, Search, Download } from 'lucide-react';
import { extractPathParamNames } from '@/lib/utils';
import { exportTableToCSV, exportTableToJSON } from '@/lib/export-utils';
import { useResourceTable } from './hooks/useResourceTable';
import { inferColumns } from './components/complex-cell-viewer';

export interface ResourceTableProps {
  path: string;
  pathParams?: Record<string, string>;
}

export function ResourceTable({ path, pathParams = {} }: ResourceTableProps) {
  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);

  // Detect any path params that haven't been filled in yet
  const pathParamNames = extractPathParamNames(path);
  const missingParams = pathParamNames.filter((name) => !pathParams[name]);

  const {
    data,
    isLoading,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    error,
    fetchData,
  } = useResourceTable({ resolvedPath, missingParams });

  const columns = inferColumns(data);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (missingParams.length > 0) {
    return (
      <div className="rounded-lg border border-muted bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Configure the required path parameters above to fetch data.
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Missing: {missingParams.map((p) => `{${p}}`).join(', ')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive mb-2">{error}</p>
        <Button size="sm" variant="outline" onClick={() => void fetchData()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Filter..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" onClick={() => void fetchData()} disabled={isLoading} className="h-8">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={isLoading || table.getFilteredRowModel().rows.length === 0} className="h-8">
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportTableToCSV(table.getFilteredRowModel().rows.map(row => row.original), `export-${Date.now()}.csv`)}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTableToJSON(table.getFilteredRowModel().rows.map(row => row.original), `export-${Date.now()}.json`)}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Badge variant="outline" className="text-xs">
          {isLoading ? '...' : `${table.getFilteredRowModel().rows.length} rows`}
        </Badge>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-9 py-0">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length || 1} className="h-24 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length || 1} className="h-24 text-center text-muted-foreground text-sm">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
