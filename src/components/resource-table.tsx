'use client';

import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Loader2, RefreshCw, Search } from 'lucide-react';
import { useSpecStore } from '@/store/spec-store';
import { OperationObject } from '@/lib/types';
import { toast } from 'sonner';

interface ResourceTableProps {
  path: string;
  operation: OperationObject;
  pathParams?: Record<string, string>;
}

const columnHelper = createColumnHelper<Record<string, unknown>>();

function inferColumns(data: Record<string, unknown>[]) {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.slice(0, 10).map((key) =>
    columnHelper.accessor(key, {
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {key}
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const val = getValue();
        if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;
        if (typeof val === 'boolean') return <Badge variant={val ? 'default' : 'secondary'}>{val ? 'true' : 'false'}</Badge>;
        if (typeof val === 'object') return <span className="text-xs text-muted-foreground font-mono">{JSON.stringify(val).slice(0, 50)}</span>;
        const strVal = String(val);
        if (strVal.length > 60) return <span title={strVal}>{strVal.slice(0, 60)}…</span>;
        return <span>{strVal}</span>;
      },
    })
  );
}

export function ResourceTable({ path, operation, pathParams = {} }: ResourceTableProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { getActiveEnvironment } = useSpecStore();

  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);

  const fetchData = async () => {
    const env = getActiveEnvironment();
    if (!env?.baseUrl) {
      setError('No base URL configured. Set one in Environment settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (env.authType === 'bearer' && env.authValue) {
        headers['Authorization'] = `Bearer ${env.authValue}`;
      } else if (env.authType === 'apiKey' && env.authValue) {
        headers[env.authHeader ?? 'X-API-Key'] = env.authValue;
      } else if (env.authType === 'basic' && env.authValue) {
        headers['Authorization'] = `Basic ${Buffer.from(env.authValue).toString('base64')}`;
      }

      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${env.baseUrl}${resolvedPath}`,
          method: 'GET',
          headers,
        }),
      });

      const result = await res.json() as unknown;
      const records = Array.isArray(result)
        ? (result as Record<string, unknown>[])
        : typeof result === 'object' && result !== null
          ? (Object.values(result as Record<string, unknown>).find(Array.isArray) as Record<string, unknown>[] | undefined) ?? [result as Record<string, unknown>]
          : [];

      setData(records);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

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
