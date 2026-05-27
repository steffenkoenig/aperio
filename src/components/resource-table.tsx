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
import { ArrowUpDown, Loader2, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useSpecStore } from '@/store/spec-store';
import { OperationObject } from '@/lib/types';
import { extractPathParamNames } from '@/lib/utils';
import { toast } from 'sonner';

interface ResourceTableProps {
  path: string;
  pathParams?: Record<string, string>;
}

const columnHelper = createColumnHelper<Record<string, unknown>>();

export function ComplexCellViewer({ val }: { val: unknown }) {
  const [isOpen, setIsOpen] = useState(false);

  if (val === null || val === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // If it's an array:
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return <span className="text-muted-foreground italic text-xs">Empty Array</span>;
    }

    // Check if the array contains objects
    const containsObjects = val.some((item) => item !== null && typeof item === 'object');

    if (containsObjects) {
      return (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline focus:outline-none"
          >
            <span>Array [{val.length} objects]</span>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {isOpen && (
            <div className="border border-muted/50 rounded-md p-2 bg-muted/10 space-y-2 mt-1 max-w-sm overflow-x-auto max-h-48 overflow-y-auto">
              {val.map((item, idx) => (
                <div key={idx} className="border-b last:border-0 pb-1.5 last:pb-0 border-muted/30">
                  <div className="text-[9px] font-mono text-muted-foreground mb-0.5">Item #{idx + 1}</div>
                  <ComplexCellViewer val={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {val.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0.25 font-mono">
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }
  }

  // If it's a general object:
  if (typeof val === 'object') {
    const keys = Object.keys(val as Record<string, unknown>);
    if (keys.length === 0) {
      return <span className="text-muted-foreground italic text-xs">Empty Object</span>;
    }

    const isComplex = Object.values(val as Record<string, unknown>).some(
      (v) => typeof v === 'object' && v !== null
    );

    if (isComplex || keys.length > 3) {
      return (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline focus:outline-none"
          >
            <span>Object [{keys.length} fields]</span>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {isOpen && (
            <div className="border border-muted/50 rounded-md p-2 bg-muted/10 space-y-1 mt-1 max-w-sm overflow-x-auto max-h-48 overflow-y-auto">
              {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="flex flex-col text-xs border-b last:border-0 pb-1 last:pb-0 border-muted/20">
                  <span className="font-mono font-semibold text-muted-foreground text-[10px]">{k}:</span>
                  <div className="pl-1">
                    {typeof v === 'object' && v !== null ? (
                      <ComplexCellViewer val={v} />
                    ) : (
                      <span className="font-mono break-all">{String(v)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-1">
              <span className="font-mono font-medium text-muted-foreground text-[10px]">{k}:</span>
              <span className="font-mono text-[11px] break-all">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
  }

  return <span>{String(val)}</span>;
}

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
        if (typeof val === 'object') return <ComplexCellViewer val={val} />;
        const strVal = String(val);
        if (strVal.length > 60) return <span title={strVal}>{strVal.slice(0, 60)}…</span>;
        return <span>{strVal}</span>;
      },
    })
  );
}

export function ResourceTable({ path, pathParams = {} }: ResourceTableProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { getActiveEnvironment } = useSpecStore();

  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);

  // Detect any path params that haven't been filled in yet
  const pathParamNames = extractPathParamNames(path);
  const missingParams = pathParamNames.filter((name) => !pathParams[name]);

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
        headers['Authorization'] = `Basic ${btoa(env.authValue)}`;
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
    if (missingParams.length === 0) {
      void fetchData();
    }
    // `fetchData` is re-created each render but relies on `resolvedPath`, `getActiveEnvironment`,
    // and auth config. We intentionally use `resolvedPath` as the sole trigger so the table
    // re-fetches whenever path params change, while `getActiveEnvironment` is always called
    // at fetch time and therefore does not need to be listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPath]);

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
