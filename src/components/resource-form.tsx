'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, ChevronDown, ChevronUp, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { OperationObject, SchemaObject, OpenApiSpec } from '@/lib/types';
import { useSpecStore } from '@/store/spec-store';
import { resolveSchema } from '@/lib/schema-resolver';
import { toast } from 'sonner';
import { cn, extractPathParamNames } from '@/lib/utils';

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
  // We always send JSON, so prefer JSON schema; fall back to urlencoded for field introspection only
  return (
    content['application/json']?.schema ??
    content['application/x-www-form-urlencoded']?.schema ??
    null
  );
}

interface FormFieldProps {
  name: string;
  schema: SchemaObject;
  value: unknown;
  onChange: (val: unknown) => void;
  required: boolean;
  components: OpenApiSpec['components'];
}

export function FormField({ name, schema, value, onChange, required, components }: FormFieldProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const itemSchema = useMemo(() => {
    if (schema.type !== 'array') return null;
    return schema.items ? resolveSchema(schema.items, components) : null;
  }, [schema.type, schema.items, components]);

  if (schema['x-pathform-hidden']) return null;

  const label = schema.title ?? name;
  const type = schema.type ?? 'string';

  // 1. Nested Object rendering
  if (type === 'object') {
    const properties = schema.properties ?? {};
    const subRequired = schema.required ?? [];

    return (
      <div className="space-y-2 border-l-2 pl-3 ml-1 border-muted/50 py-1.5 transition-all">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-semibold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
          {schema.description && (
            <span className="text-[10px] font-normal text-muted-foreground line-clamp-1">– {schema.description}</span>
          )}
        </button>

        {!isCollapsed && (
          <div className="space-y-3 pt-1">
            {Object.entries(properties).map(([subName, subSchema]) => {
              const subVal = (value as Record<string, unknown> | undefined)?.[subName];
              return (
                <FormField
                  key={subName}
                  name={subName}
                  schema={subSchema as SchemaObject}
                  value={subVal}
                  onChange={(newSubVal) => {
                    const updated = { ...(value as Record<string, unknown> || {}) };
                    if (newSubVal === undefined || newSubVal === '') {
                      delete updated[subName];
                    } else {
                      updated[subName] = newSubVal;
                    }
                    onChange(Object.keys(updated).length > 0 ? updated : undefined);
                  }}
                  required={subRequired.includes(subName)}
                  components={components}
                />
              );
            })}
            {Object.keys(properties).length === 0 && (
              <p className="text-xs text-muted-foreground italic pl-1">Empty Object</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. Array rendering
  if (type === 'array') {
    const itemType = itemSchema?.type ?? 'string';

    if (itemType === 'object') {
      const arrayVal = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

      return (
        <div className="space-y-2 border-l-2 pl-3 ml-1 border-muted/50 py-1.5 transition-all">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs font-semibold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none"
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{label}</span>
              {required && <span className="text-destructive">*</span>}
              {schema.description && (
                <span className="text-[10px] font-normal text-muted-foreground line-clamp-1">– {schema.description}</span>
              )}
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange([...arrayVal, {}]);
                setIsCollapsed(false);
              }}
              className="h-6 text-[10px] px-2 flex items-center gap-1 border-primary/20 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              Add Item
            </Button>
          </div>

          {!isCollapsed && (
            <div className="space-y-3 pt-1">
              {arrayVal.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No items added</p>
              ) : (
                <div className="space-y-3">
                  {arrayVal.map((item, index) => (
                    <div key={index} className="relative border rounded-md p-3 bg-muted/5 border-muted/60 space-y-3">
                      <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-muted/60">
                        <span className="text-[10px] font-mono font-medium text-muted-foreground">Item #{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newArray = [...arrayVal];
                            newArray.splice(index, 1);
                            onChange(newArray.length > 0 ? newArray : undefined);
                          }}
                          className="h-5 text-[10px] px-1.5 text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                      {itemSchema && itemSchema.properties ? (
                        Object.entries(itemSchema.properties).map(([subName, subSchema]) => {
                          const subVal = item?.[subName];
                          return (
                            <FormField
                              key={subName}
                              name={subName}
                              schema={subSchema as SchemaObject}
                              value={subVal}
                              onChange={(newSubVal) => {
                                const newArray = [...arrayVal];
                                const updatedItem = { ...newArray[index] };
                                if (newSubVal === undefined || newSubVal === '') {
                                  delete updatedItem[subName];
                                } else {
                                  updatedItem[subName] = newSubVal;
                                }
                                newArray[index] = updatedItem;
                                onChange(newArray);
                              }}
                              required={(itemSchema.required ?? []).includes(subName)}
                              components={components}
                            />
                          );
                        })
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
            {schema.description && (
              <span className="text-muted-foreground font-normal">– {schema.description}</span>
            )}
          </label>
          <Input
            value={Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '')}
            onChange={(e) => {
              const val = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
              onChange(val.length > 0 ? val : undefined);
            }}
            placeholder="comma, separated, values"
            className="h-8 text-sm border-muted/70"
          />
        </div>
      );
    }
  }

  // 3. Simple fields
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {schema.description && (
          <span className="text-muted-foreground font-normal">– {schema.description}</span>
        )}
      </label>
      {type === 'boolean' ? (
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-muted/50 text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ) : schema.enum ? (
        <select
          className="w-full border rounded-md p-2 text-sm bg-background border-muted/70 focus:border-primary focus:outline-none"
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
          className="h-8 text-sm border-muted/70"
        />
      ) : (
        <Input
          type={schema.format === 'password' ? 'password' : schema.format === 'email' ? 'email' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={String(schema.default ?? schema.description ?? '')}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          className="h-8 text-sm border-muted/70"
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
    } catch {
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
      } catch {
        // Ignore local storage errors (quota exceeded, etc)
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [formData, isDraftLoaded, draftKey]);

  const handleDiscardDraft = () => {
    setFormData({});
    try {
      localStorage.removeItem(draftKey);
    } catch {}
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
        } catch {}
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
