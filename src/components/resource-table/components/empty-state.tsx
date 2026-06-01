import { Button } from '@/components/ui/button';

export function ResourceTableMissingParams({ missingParams }: { missingParams: string[] }) {
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

export function ResourceTableError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
      <p className="text-sm text-destructive mb-2">{error}</p>
      <Button size="sm" variant="outline" onClick={retry}>Retry</Button>
    </div>
  );
}
