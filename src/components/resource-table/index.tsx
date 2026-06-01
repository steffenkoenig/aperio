'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  VisibilityState,
  SortingState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, RefreshCw, Search, Download, Save, Trash2 } from 'lucide-react';
import { extractPathParamNames } from '@/lib/utils';
import { exportTableToCSV, exportTableToJSON } from '@/lib/export-utils';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';
import { useResourceTable } from './hooks/useResourceTable';
import { inferColumns } from './components/complex-cell-viewer';

export interface ResourceTableProps {
  path: string;
  pathParams?: Record<string, string>;
}

export function ResourceTable({ path, pathParams = {} }: ResourceTableProps) {
  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);

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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [activeViewId, setActiveViewId] = useState<string>('default');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const { specSource, preferences, saveView, deleteView } = useSpecStore();
  const savedViewsForPath = specSource
    ? (preferences[specSource]?.savedViews || []).filter(v => v.resourcePath === path)
    : [];

  const columns = inferColumns(data);

  const resourceName = path.split('/').filter(Boolean).pop() || 'export';
  const currentDate = new Date().toISOString().split('T')[0];
  const baseExportName = `${resourceName}_export_${currentDate}`;

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
            <DropdownMenuItem onClick={() => exportTableToCSV(table.getFilteredRowModel().rows.map(row => row.original), `${baseExportName}.csv`)}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTableToJSON(table.getFilteredRowModel().rows.map(row => row.original), `${baseExportName}.json`)}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Badge variant="outline" className="text-xs">
          {isLoading ? '...' : `${table.getFilteredRowModel().rows.length} rows`}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {savedViewsForPath.length > 0 && (
          <select
            className="h-8 text-xs border rounded bg-background px-2 py-1 max-w-[150px] outline-none"
            value={activeViewId}
            onChange={(e) => {
              const id = e.target.value;
              setActiveViewId(id);
              if (id === 'default') {
                setSorting([]);
                setGlobalFilter('');
                setColumnVisibility({});
              } else {
                const view = savedViewsForPath.find(v => v.id === id);
                if (view) {
                  setSorting(view.sorting as SortingState);
                  setGlobalFilter(view.globalFilter);
                  setColumnVisibility(view.columnVisibility);
                }
              }
            }}
          >
            <option value="default">Default View</option>
            {savedViewsForPath.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        )}

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Save className="h-3 w-3" /> Save View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Current View</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="view-name" className="text-right text-sm font-medium">Name</label>
                <Input
                  id="view-name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="e.g. Active Users"
                  className="col-span-3 h-8"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                disabled={!newViewName.trim()}
                onClick={() => {
                  const id = crypto.randomUUID();
                  saveView({ id, name: newViewName.trim(), resourcePath: path, globalFilter, sorting: sorting as { id: string; desc: boolean }[], columnVisibility });
                  setActiveViewId(id);
                  setSaveDialogOpen(false);
                  setNewViewName('');
                  toast.success('View saved');
                }}
              >Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {activeViewId !== 'default' && (
          <Button
            size="sm" variant="ghost"
            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { deleteView(activeViewId); setActiveViewId('default'); setSorting([]); setGlobalFilter(''); setColumnVisibility({}); toast.success('View deleted'); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
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
