'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { OperationObject, SchemaObject } from '@/lib/types';
import { useSpecStore } from '@/store/spec-store';
import { resolveSchema } from '@/lib/schema-resolver';
import { toast } from 'sonner';
import { cn, extractPathParamNames } from '@/lib/utils';
import { FormField } from './fields/form-field';
import { getSchema } from './hooks/use-schema';

export interface ResourceFormProps {
  path: string;
  method: string;
  operation: OperationObject;
  pathParams?: Record<string, string>;
  onSuccess?: (data: unknown) => void;
}

export function ResourceForm({ path, method, operation, pathParams = {}, onSuccess }: ResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const { getActiveEnvironment, parsedSpec } = useSpecStore();

  const draftKey = `draft_${parsedSpec?.title ?? 'default'}_${method.toUpperCase()}_${path}`;

  useEffect(() => {
    // Load draft on mount
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        setFormData(JSON.parse(draft));
        toast('Draft restored', {
          description: 'Your previous form data has been loaded.',
          duration: 3000,
        });
      }
    } catch (e) {
      // Ignore local storage errors
    }
    setIsDraftLoaded(true);
  }, [draftKey]);

  useEffect(() => {
    if (!isDraftLoaded) return;

    const handler = setTimeout(() => {
      try {
        if (Object.keys(formData).length > 0) {
          localStorage.setItem(draftKey, JSON.stringify(formData));
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch (e) {
        // Ignore local storage errors (quota exceeded, etc)
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [formData, isDraftLoaded, draftKey]);

  const handleDiscardDraft = () => {
    setFormData({});
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {}
    toast.success('Draft discarded');
  };

  const rawSchema = getSchema(operation);
  const components = parsedSpec?.raw.components;
  const schema = useMemo(() => {
    return rawSchema ? resolveSchema(rawSchema, components) : null;
  }, [rawSchema, components]);
  const properties = schema?.properties ?? {};
  const required = schema?.required ?? [];

  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, key: string) => pathParams[key] ?? `:${key}`);

  // Detect missing path parameters to disable submit and warn the user
  const pathParamNames = extractPathParamNames(path);
  const missingParams = pathParamNames.filter((name) => !pathParams[name]);

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

      if (res.ok) {
        toast.success(`${method.toUpperCase()} ${resolvedPath} – ${res.status}`);
        onSuccess?.(result);

        // Clear draft on successful submit
        try {
          localStorage.removeItem(draftKey);
        } catch (e) {}
      } else {
        const details = typeof result === 'object' && result !== null && 'error' in result ? String((result as Record<string, unknown>).error) : '';
        const msg = details ? `${res.status}: ${details}` : `${res.status} ${res.statusText || ''}`;
        toast.error(`${method.toUpperCase()} ${resolvedPath} – ${msg}`);
      }
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
          {Object.entries(properties).map(([name, fieldSchema]) => (
            <FormField
              key={name}
              name={name}
              schema={fieldSchema as SchemaObject}
              value={formData[name]}
              onChange={(val) => setFormData((prev) => ({ ...prev, [name]: val }))}
              required={required.includes(name)}
              components={components}
            />
          ))}

          {Object.keys(properties).length === 0 && !schema && (
            <p className="text-sm text-muted-foreground italic">No request body required</p>
          )}

          {missingParams.length > 0 && (
            <p className="text-xs text-destructive">
              Missing path parameters: {missingParams.map((p) => `{${p}}`).join(', ')} — configure them above.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading || missingParams.length > 0}
              size="sm"
              className={cn(method.toLowerCase() === 'delete' && 'bg-destructive hover:bg-destructive/90')}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              {method.toUpperCase()}
            </Button>

            {Object.keys(formData).length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscardDraft}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Discard Draft
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const env = getActiveEnvironment();
                if (!env?.baseUrl) {
                  toast.error('No base URL configured.');
                  return;
                }

                const headers: Record<string, string> = {};
                const hasBody = Object.keys(formData).length > 0;
                if (hasBody) {
                  headers['Content-Type'] = 'application/json';
                }

                if (env.authType === 'bearer' && env.authValue) {
                  headers['Authorization'] = `Bearer ${env.authValue}`;
                } else if (env.authType === 'apiKey' && env.authValue) {
                  headers[env.authHeader ?? 'X-API-Key'] = env.authValue;
                } else if (env.authType === 'basic' && env.authValue) {
                  headers['Authorization'] = `Basic ${btoa(env.authValue)}`;
                }

                const options: RequestInit = {
                  method: method.toUpperCase(),
                  headers,
                };

                let bodyStr = '';
                if (hasBody) {
                  bodyStr = JSON.stringify(formData, null, 2);
                  options.body = bodyStr;
                }

                const fetchCode = `fetch('${env.baseUrl}${resolvedPath}', {\n  method: '${options.method}',\n  headers: ${JSON.stringify(options.headers, null, 2).replace(/\n/g, '\n  ')}${bodyStr ? `,\n  body: JSON.stringify(${bodyStr.replace(/\n/g, '\n  ')})` : ''}\n});`;

                if (!navigator.clipboard) {
                  toast.error('Clipboard API not available in this browser/context');
                  return;
                }

                navigator.clipboard.writeText(fetchCode).then(() => {
                  toast.success('Fetch code copied to clipboard');
                }).catch(() => {
                  toast.error('Failed to copy code to clipboard');
                });
              }}
              disabled={missingParams.length > 0}
            >
              Copy as Fetch
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
