import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';

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

const columnHelper = createColumnHelper<Record<string, unknown>>();

export function inferColumns(data: Record<string, unknown>[]) {
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
