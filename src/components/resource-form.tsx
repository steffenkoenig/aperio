'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { OperationObject, SchemaObject } from '@/lib/types';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResourceFormProps {
  path: string;
  method: string;
  operation: OperationObject;
  pathParams?: Record<string, string>;
  onSuccess?: (data: unknown) => void;
}

function getSchema(operation: OperationObject): SchemaObject | null {
  const content = operation.requestBody?.content;
  if (!content) return null;
  return (
    content['application/json']?.schema ??
    content['application/x-www-form-urlencoded']?.schema ??
    null
  );
}

function renderField(
  name: string,
  schema: SchemaObject,
  value: unknown,
  onChange: (val: unknown) => void,
  required: boolean
) {
  if (schema['x-pathform-hidden']) return null;

  const label = schema.title ?? name;
  const type = schema.type ?? 'string';

  return (
    <div key={name} className="space-y-1">
      <label className="text-xs font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {schema.description && (
          <span className="text-muted-foreground font-normal">– {schema.description}</span>
        )}
      </label>
      {type === 'boolean' ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      ) : schema.enum ? (
        <select
          className="w-full border rounded-md p-2 text-sm bg-background"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {schema.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
          ))}
        </select>
      ) : type === 'integer' || type === 'number' ? (
        <Input
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder={String(schema.default ?? '')}
          min={schema.minimum}
          max={schema.maximum}
          className="h-8 text-sm"
        />
      ) : type === 'array' ? (
        <Input
          value={Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '')}
          onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder="comma, separated, values"
          className="h-8 text-sm"
        />
      ) : (
        <Input
          type={schema.format === 'password' ? 'password' : schema.format === 'email' ? 'email' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={String(schema.default ?? schema.description ?? '')}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          className="h-8 text-sm"
        />
      )}
    </div>
  );
}

export function ResourceForm({ path, method, operation, pathParams = {}, onSuccess }: ResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const { getActiveEnvironment } = useSpecStore();

  const schema = getSchema(operation);
  const properties = schema?.properties ?? {};
  const required = schema?.required ?? [];

  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const env = getActiveEnvironment();
    if (!env?.baseUrl) {
      toast.error('No base URL configured. Set one in Environment settings.');
      return;
    }

    setIsLoading(true);
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
          method: method.toUpperCase(),
          headers,
          body: Object.keys(formData).length > 0 ? formData : undefined,
        }),
      });

      const result = await res.json() as unknown;
      setResponse(result);
      setShowResponse(true);
      toast.success(`${method.toUpperCase()} ${resolvedPath} – ${res.status}`);
      onSuccess?.(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const methodColor: Record<string, string> = {
    post: 'bg-green-500/10 text-green-600 border-green-500/30',
    put: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    patch: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    delete: 'bg-red-500/10 text-red-600 border-red-500/30',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-xs font-mono border', methodColor[method.toLowerCase()] ?? 'bg-muted')}>{method.toUpperCase()}</span>
          <code className="text-xs font-mono text-muted-foreground">{path}</code>
          {operation.summary && <span className="text-xs font-normal text-muted-foreground">– {operation.summary}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          {Object.entries(properties).map(([name, fieldSchema]) =>
            renderField(
              name,
              fieldSchema as SchemaObject,
              formData[name],
              (val) => setFormData((prev) => ({ ...prev, [name]: val })),
              required.includes(name)
            )
          )}

          {Object.keys(properties).length === 0 && !schema && (
            <p className="text-sm text-muted-foreground italic">No request body required</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className={cn(method.toLowerCase() === 'delete' && 'bg-destructive hover:bg-destructive/90')}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              {method.toUpperCase()}
            </Button>
          </div>
        </form>

        {response !== null && (
          <div className="mt-3 border rounded-md overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 text-xs font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setShowResponse(!showResponse)}
            >
              Response
              {showResponse ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showResponse && (
              <pre className="p-3 text-xs font-mono overflow-auto max-h-64 bg-muted/10">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
