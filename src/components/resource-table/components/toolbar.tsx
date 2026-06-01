import { Table as TanStackTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, RefreshCw, Search, Download } from 'lucide-react';
import { exportTableToCSV, exportTableToJSON } from '@/lib/export-utils';

export interface ResourceTableToolbarProps<TData> {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  isLoading: boolean;
  fetchData: () => Promise<void>;
  table: TanStackTable<TData>;
}

export function ResourceTableToolbar<TData>({
  globalFilter,
  setGlobalFilter,
  isLoading,
  fetchData,
  table,
}: ResourceTableToolbarProps<TData>) {
  return (
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
          <DropdownMenuItem onClick={() => exportTableToCSV(table.getFilteredRowModel().rows.map(row => row.original as Record<string, unknown>), `export-${Date.now()}.csv`)}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportTableToJSON(table.getFilteredRowModel().rows.map(row => row.original as Record<string, unknown>), `export-${Date.now()}.json`)}>
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge variant="outline" className="text-xs">
        {isLoading ? '...' : `${table.getFilteredRowModel().rows.length} rows`}
      </Badge>
    </div>
  );
}
