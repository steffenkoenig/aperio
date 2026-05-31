import { useState, useEffect } from 'react';
import { useSpecStore } from '@/store/spec-store';
import { toast } from 'sonner';

export interface UseResourceFormProps {
  path: string;
  method: string;
  resolvedPath: string;
  onSuccess?: (data: unknown) => void;
}

export function useResourceForm({ path, method, resolvedPath, onSuccess }: UseResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const { getActiveEnvironment, parsedSpec } = useSpecStore();

  const draftKey = `draft_${parsedSpec?.title ?? 'default'}_${method.toUpperCase()}_${path}`;

  useEffect(() => {
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

        try {
          localStorage.removeItem(draftKey);
            } catch {}
      } else {
        const details = typeof result === 'object' && result !== null && 'error' in result ? String((result as { error?: unknown }).error) : '';
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

  const copyAsFetch = (options: { formData: Record<string, unknown>, method: string, resolvedPath: string }) => {
    const env = getActiveEnvironment();
    if (!env?.baseUrl) {
      toast.error('No base URL configured.');
      return;
    }

    const headers: Record<string, string> = {};
    const hasBody = Object.keys(options.formData).length > 0;
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

    const reqOptions: RequestInit = {
      method: options.method.toUpperCase(),
      headers,
    };

    let bodyStr = '';
    if (hasBody) {
      bodyStr = JSON.stringify(options.formData, null, 2);
      reqOptions.body = bodyStr;
    }

    const fetchCode = `fetch('${env.baseUrl}${options.resolvedPath}', {\n  method: '${reqOptions.method}',\n  headers: ${JSON.stringify(reqOptions.headers, null, 2).replace(/\n/g, '\n  ')}${bodyStr ? `,\n  body: JSON.stringify(${bodyStr.replace(/\n/g, '\n  ')})` : ''}\n});`;

    if (!navigator.clipboard) {
      toast.error('Clipboard API not available in this browser/context');
      return;
    }

    navigator.clipboard.writeText(fetchCode).then(() => {
      toast.success('Fetch code copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy code to clipboard');
    });
  };

  return {
    formData,
    setFormData,
    response,
    isLoading,
    showResponse,
    setShowResponse,
    handleDiscardDraft,
    handleSubmit,
    copyAsFetch
  };
}
